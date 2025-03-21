export default function Footer() {
  return (
    <footer className="border-t dark:border-gray-800 py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Image Compressor - Optimize your images online without losing quality
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Image Compressor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
