import { Octokit } from '@octokit/rest';
import { Logger } from '../utils/logger.js';

export class GitHubProvider {
  private octokit: Octokit;
  private logger: Logger;
  private owner: string;
  private repo: string;

  constructor() {
    this.logger = new Logger('GitHubProvider');
    
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    
    this.owner = process.env.GITHUB_OWNER || '';
    this.repo = process.env.GITHUB_REPO || '';
    
    if (!this.owner || !this.repo) {
      this.logger.warn('GITHUB_OWNER and GITHUB_REPO should be set for full functionality');
    }
  }

  isHealthy(): boolean {
    return !!process.env.GITHUB_TOKEN;
  }

  async handleRequest(method: string, path: string, body: any) {
    const routes = {
      'GET:/repos': () => this.listRepos(),
      'GET:/branches': () => this.listBranches(),
      'GET:/commits': () => this.listCommits(),
      'POST:/webhook': () => this.handleWebhook(body),
    };

    const route = `${method}:${path}`;
    const handler = routes[route as keyof typeof routes];
    
    if (handler) {
      return await handler();
    }
    
    throw new Error(`GitHub route not found: ${route}`);
  }

  async readFile(path: string, branch: string = 'main') {
    try {
      this.logger.info(`Reading file: ${path} from branch: ${branch}`);
      
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return {
          content,
          sha: response.data.sha,
          path: response.data.path,
          message: `Successfully read ${path}`,
        };
      }

      throw new Error('File content not available');
    } catch (error) {
      this.logger.error(`Failed to read file ${path}:`, error);
      throw error;
    }
  }

  async writeFile(path: string, content: string, message: string, branch: string = 'main') {
    try {
      this.logger.info(`Writing file: ${path} to branch: ${branch}`);
      
      // Check if file exists to get SHA
      let sha: string | undefined;
      try {
        const existing = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: branch,
        });
        
        if ('sha' in existing.data) {
          sha = existing.data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's fine
        this.logger.info(`File ${path} doesn't exist, creating new file`);
      }

      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha }),
      });

      return {
        message: `Successfully wrote ${path}`,
        commit: response.data.commit,
        content: response.data.content,
      };
    } catch (error) {
      this.logger.error(`Failed to write file ${path}:`, error);
      throw error;
    }
  }

  async createPR(title: string, body: string = '', head: string, base: string = 'main') {
    try {
      this.logger.info(`Creating PR: ${title} from ${head} to ${base}`);
      
      const response = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head,
        base,
      });

      return {
        message: `Successfully created PR #${response.data.number}`,
        pullRequest: {
          number: response.data.number,
          url: response.data.html_url,
          title: response.data.title,
          state: response.data.state,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create PR:', error);
      throw error;
    }
  }

  async listRepos() {
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        per_page: 50,
        sort: 'updated',
      });

      return {
        repositories: response.data.map(repo => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          private: repo.private,
          updatedAt: repo.updated_at,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to list repositories:', error);
      throw error;
    }
  }

  async listBranches() {
    try {
      const response = await this.octokit.repos.listBranches({
        owner: this.owner,
        repo: this.repo,
      });

      return {
        branches: response.data.map(branch => ({
          name: branch.name,
          commit: branch.commit.sha,
          protected: branch.protected,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to list branches:', error);
      throw error;
    }
  }

  async listCommits(branch: string = 'main', limit: number = 10) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: branch,
        per_page: limit,
      });

      return {
        commits: response.data.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
          url: commit.html_url,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to list commits:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    this.logger.info('Processing GitHub webhook:', payload.action);
    
    // Handle different webhook events
    switch (payload.action) {
      case 'opened':
      case 'synchronize':
        if (payload.pull_request) {
          return this.handlePREvent(payload);
        }
        break;
      case 'pushed':
        return this.handlePushEvent(payload);
      default:
        this.logger.info(`Unhandled webhook action: ${payload.action}`);
    }

    return { message: 'Webhook processed' };
  }

  private async handlePREvent(payload: any) {
    const pr = payload.pull_request;
    this.logger.info(`PR #${pr.number} ${payload.action}: ${pr.title}`);
    
    return {
      message: `Processed PR #${pr.number}`,
      pr: {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        action: payload.action,
      },
    };
  }

  private async handlePushEvent(payload: any) {
    const commits = payload.commits || [];
    this.logger.info(`Push to ${payload.ref} with ${commits.length} commits`);
    
    return {
      message: `Processed push to ${payload.ref}`,
      commits: commits.length,
      branch: payload.ref,
    };
  }
}