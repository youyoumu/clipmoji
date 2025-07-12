const iframe = document.createElement("iframe");
console.log(
  "Token: %c%s",
  "font-size:16px;",
  JSON.parse(
    document.body.appendChild(iframe).contentWindow.localStorage.token,
  ),
);
iframe.remove();
