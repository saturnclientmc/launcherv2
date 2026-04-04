import VersionDropdown from "./VersionDropdown";
import AccountDropdown from "./AccountDropdown";
import { Props } from "./props";

export default function TopBar(props: Props) {
  return (
    <header className="h-14 border-b border-saturn-border flex items-center justify-between px-6 bg-saturn-panel/30 backdrop-blur-md z-100 py-10">
      <VersionDropdown {...props} />

      <AccountDropdown {...props} />
    </header>
  );
}
