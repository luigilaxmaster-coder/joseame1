import PhotoGallery from '@/components/PhotoGallery';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PhotoGallery />
      </main>
      <Footer />
    </div>
  );
}
