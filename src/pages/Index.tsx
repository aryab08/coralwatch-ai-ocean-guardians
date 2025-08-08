import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CoralInfo from "@/components/CoralInfo";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CoralInfo />
      </main>
    </div>
  );
};

export default Index;
