import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

test('Create GitHub repository automatically', async ({}) => {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_EMAIL;
  const repoName = `auto-repo-${Date.now()}`;
  const description = 'This repository was created using Playwright + TypeScript automation!';

  if (!token || !username) {
    throw new Error('❌ Missing GitHub credentials. Please check your .env file.');
  }

  console.log('🚀 Creating repo:', repoName);

  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      name: repoName,
      description,
      private: false
    })
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Repository created successfully!');
    console.log('🔗 Repo URL:', data.html_url);
  } else {
    console.error('❌ Failed to create repo:', data);
    expect(response.ok, `GitHub API error: ${JSON.stringify(data)}`).toBeTruthy();
  }

  // Validate repo name in response
  expect(data.name).toBe(repoName);
});
