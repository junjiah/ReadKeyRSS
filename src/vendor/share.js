const renderTwitterShare = () => {
  var scriptEle = document.getElementById("twitter-wjs");
  if (scriptEle != null) {
    scriptEle.parentNode.removeChild(scriptEle);
  }
  
  !function(t,e,r){var n,i=t.getElementsByTagName(e)[0],w=window.twttr||{};return t.getElementById(r)?w:(n=t.createElement(e),n.id=r,n.src="https://platform.twitter.com/widgets.js",i.parentNode.insertBefore(n,i),w._e=[],w.ready=function(t){w._e.push(t)},w)}(document,"script","twitter-wjs");
};
const renderPocketShare = () => {
  var scriptEle = document.getElementById("pocket-btn-js");
  if (scriptEle != null) {
    scriptEle.parentNode.removeChild(scriptEle);
  }
  
  !function(d,i){if(!d.getElementById(i)){var j=d.createElement("script");j.id=i;j.src="https://widgets.getpocket.com/v1/j/btn.js?v=1";var w=d.getElementById(i);d.body.appendChild(j);}}(document,"pocket-btn-js");
};

export { renderTwitterShare, renderPocketShare };
