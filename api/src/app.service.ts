import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHomePage(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ForgePlace API</title>
    <style>
      body {
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        background: #0a0c10;
        color: #e6e8ee;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
      .box {
        background: #131722;
        border: 1px solid #242b3b;
        border-radius: 16px;
        padding: 48px 56px;
        max-width: 480px;
        text-align: center;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #34d399;
        border: 1px solid rgba(52, 211, 153, 0.35);
        background: rgba(52, 211, 153, 0.08);
        padding: 6px 12px;
        border-radius: 999px;
        margin-bottom: 18px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
      }
      h1 {
        font-size: 22px;
        margin: 0 0 10px;
      }
      p {
        color: #8b91a7;
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 24px;
      }
      a {
        display: inline-block;
        color: #fff;
        background: linear-gradient(135deg, #7c5cff, #5b3ef0);
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        padding: 12px 22px;
        border-radius: 10px;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="status"><span class="dot"></span>Server is running</div>
      <h1>ForgePlace API</h1>
      <p>The API server is up. Explore the Swagger docs to discover and test the endpoints.</p>
      <a href="/chamber-of-secrets">Open API Docs</a>
    </div>
  </body>
</html>`;
  }
}