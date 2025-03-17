import React from "react";

const AdComponent = () => {
  return (
    <div className="mt-4 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6697752785156392"
        data-ad-slot="5189683278"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
};

export default AdComponent;