import createClient from "openapi-fetch";
import type { paths } from "./generated";

export const client = createClient<paths>({
  baseUrl: "http://localhost:8000",
});
/*
client.use({
  async onRequest({ request }) {
    request.headers.set(
      "Authorization",
      `Bearer ${token}`,
    );

    return request;
  },
});
*/