import Products from "components/landing/Products";
import SecuritySection from "components/landing/SecuritySection";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Hero from "components/landing/Hero";
import NoSSR from "react-no-ssr";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);
  
  return (
    <main>
      <NoSSR>
        <Hero />
        <Products />
      </NoSSR>
    </main>
  );
};

export default IndexPage;
