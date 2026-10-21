import { ItemSearchSection } from './components/ItemSearchSection';
import { ItemHeader } from './components/ItemHeader';

export default function Page() {
  return (
    <main className="p-4 sm:p-6 max-w-[64rem] mx-auto min-h-screen flex flex-col bg-[#dc0a2d] rounded-2xl text-white space-y-4">
      <ItemHeader />
      <ItemSearchSection />
    </main>
  );
}
