export function createModal(iframeSrc) {
  const overlay = document.createElement("div");
  overlay.style = `
    position: fixed;
    top:0;left:0;right:0;bottom:0;
    background: rgba(0,0,0,0.6);
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
  `;

  const iframe = document.createElement("iframe");
  iframe.src = iframeSrc;
  iframe.style = `
    width: 420px;
    height: 540px;
    border: none;
    border-radius: 8px;
    background: #fff;
  `;

  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  return {
    close() {
      document.body.removeChild(overlay);
    }
  };
}
