import Products from "components/landing/Products";
import SecuritySection from "components/landing/SecuritySection";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Hero from "components/landing/Hero";
import NoSSR from "react-no-ssr";
import Footer from "components/Footer";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <NoSSR>
      <Hero />
      <Products />
    </NoSSR>
  );
};

export default IndexPage;
