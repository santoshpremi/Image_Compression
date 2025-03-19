import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BasicCompressor from "@/components/BasicCompressor";

export const metadata: Metadata = {
  title: "Image Compressor - Optimize Your Images Online",
  description: "Compress and optimize your images online without losing quality. Reduce file size and maintain image quality with our free image compression tool.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 overflow-auto">
        <BasicCompressor />
      </main>
      <Footer />
    </div>
  );
}
