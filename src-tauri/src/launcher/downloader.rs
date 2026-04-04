use futures::{stream, StreamExt};
use reqwest::{Client, IntoUrl};
use std::{
    path::Path,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::{
    fs::File,
    io::{AsyncWriteExt, BufWriter},
};

use lyceris::{
    error::Error,
    minecraft::{
        emitter::{Emitter, Event},
        install::FileType,
    },
    util::retry::retry,
};

/// Downloads a file from the specified URL and saves it to the given destination.
///
/// This function performs an asynchronous HTTP GET request to the provided URL,
/// streams the response body, and writes the content to a file at the specified
/// destination. It also provides progress updates through a callback function.
///
/// # Parameters
///
/// - `url`: The URL of the file to download. It can be any type that implements
///   the `IntoUrl` trait, such as a string slice or a `String`.
/// - `destination`: A `PathBuf` representing the path where the downloaded file
///   will be saved.
/// - `emitter`: An optional emitter for logging progress.
///
/// # Returns
///
/// This function returns a `Result<u64, Error>`. On success, it returns
/// `Ok(u64)`, where `u64` is the total size of the downloaded file. If an error
/// occurs during the download process, it returns an `Err` containing an `Error`
/// that describes the failure.
///
/// # Errors
///
/// The function can fail in several ways, including but not limited to:
/// - Network errors when making the HTTP request.
/// - Non-success HTTP status codes (e.g., 404 Not Found).
/// - Errors when creating or writing to the file.
pub async fn download<P: AsRef<Path>>(
    url: impl IntoUrl,
    destination: P,
    emitter: Option<&Emitter>,
    client: Option<&Client>,
) -> lyceris::Result<u64> {
    let default_client = Client::default();
    let client = client.unwrap_or(&default_client);

    let response = client.get(url).send().await?;

    if !response.status().is_success() {
        return Err(Error::Download(response.status().to_string()));
    }

    let total_size = response.content_length().unwrap_or(0);
    let mut downloaded: u64 = 0;

    // 🔥 Assume dirs already created (move this OUTSIDE for max speed)
    if let Some(parent) = destination.as_ref().parent() {
        let _ = tokio::fs::create_dir_all(parent).await;
    }

    let file = File::create(&destination).await?;
    let mut writer = BufWriter::with_capacity(64 * 1024, file); // 🔥 BIG WIN

    let mut stream = response.bytes_stream();

    let mut last_emit = 0;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;

        downloaded += chunk.len() as u64;

        writer.write_all(&chunk).await?;

        // 🔥 Emit less frequently (huge improvement)
        if downloaded - last_emit > 256 * 1024 || downloaded == total_size {
            if let Some(emitter) = emitter {
                emitter
                    .emit(
                        Event::SingleDownloadProgress,
                        (
                            destination.as_ref().to_string_lossy().into_owned(),
                            downloaded,
                            total_size,
                        ),
                    )
                    .await;
            }

            last_emit = downloaded;
        }
    }

    writer.flush().await?;

    Ok(total_size)
}

/// Downloads multiple files from the specified URLs and saves them to the given destinations.
///
/// This function takes a vector of tuples, where each tuple contains a URL and a destination path.
/// It downloads all files in parallel and provides progress updates through a callback function.
///
/// # Parameters
///
/// - `downloads`: A vector of tuples containing the URLs and their corresponding destination paths.
/// - `emitter`: An optional emitter for logging progress.
///
/// # Returns
///
/// This function returns a `Result<(), Error>`. On success, it returns `Ok(())`. If an error occurs
/// during the download process, it returns an `Err` containing an `Error` that describes the failure.
pub async fn download_multiple<U, P>(
    downloads: Vec<(U, P, FileType)>,
    emitter: Option<&Emitter>,
    client: Option<&Client>,
) -> lyceris::Result<()>
where
    U: IntoUrl + Send,               // URL type that implements IntoUrl
    P: AsRef<Path> + Send + 'static, // Path type
{
    let total_files = downloads.len();
    let total_downloaded = Arc::new(AtomicUsize::new(0));

    let tasks = downloads.into_iter().map(|(url, destination, file_type)| {
        let total_downloaded = total_downloaded.clone();

        async move {
            let result = retry(
                || async { download(url.as_str(), destination.as_ref(), emitter, client).await },
                Result::is_ok,
                3,
                Duration::from_millis(300), // 🔥 faster retry
            )
            .await;

            match result {
                Ok(_) => {
                    let downloaded = total_downloaded.fetch_add(1, Ordering::Relaxed) + 1;

                    if downloaded % 25 == 0 || downloaded == total_files {
                        if let Some(emitter) = emitter {
                            emitter
                                .emit(
                                    Event::MultipleDownloadProgress,
                                    (
                                        destination.as_ref().to_string_lossy().into_owned(),
                                        downloaded as u64,
                                        total_files as u64,
                                        file_type.to_string(),
                                    ),
                                )
                                .await;
                        }
                    }

                    Ok::<(), Error>(())
                }
                Err(e) => Err(e),
            }
        }
    });

    let mut stream = stream::iter(tasks).buffer_unordered(get_optimal_concurrency());

    while let Some(result) = stream.next().await {
        result?;
    }

    Ok(())
}

fn get_optimal_concurrency() -> usize {
    // Good defaults for Minecraft-scale downloads
    match std::thread::available_parallelism() {
        Ok(n) => (n.get() * 16).clamp(32, 128),
        Err(_) => 64,
    }
}
