const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const port = process.env.PORT || "passenger";
    server.listen(port, (err) => {
        if (err) throw err;
        console.log("> Next.js Server Ready");
    });
});
