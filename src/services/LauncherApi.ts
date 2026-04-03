import { invoke } from "@tauri-apps/api/core";

const clientId = "74909cec-49b6-4fee-aa60-1b2a57ef72e1";

export async function authenticate() {
  return await invoke("plugin:lighty-launcher|authenticate", {
    client_id: clientId,
  });
}

export async function launch() {
  return await invoke("launch");
}
