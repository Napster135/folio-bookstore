import dns from "dns";

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const { default: app } = await import("./server.js");
const { PORT } = await import("./src/config/index.config.js");

const server = app.listen(PORT, () => {
  console.log(`Escuchando el puerto: ${server.address().port}`);
});

server.on("error", (error) => console.log(error));