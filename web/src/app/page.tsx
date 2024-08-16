import React from "react";
import WikipediaBrowser from "../components/WikipediaBrowser";
import { GoogleAnalytics } from "@next/third-parties/google";


const Home: React.FC = () => {
  return (
    <div>
      <WikipediaBrowser />
      <GoogleAnalytics gaId="G-XFQJZD9P2K" />
    </div>
  );
};

export default Home;
