import React, { useEffect } from "react";
import OurStorySection from "../components/home/OurStorySection";

const Mission = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <main className="pt-0 pb-16">
        <OurStorySection />
      </main>
    </>
  );
};

export default Mission;
