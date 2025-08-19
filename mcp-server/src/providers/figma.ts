import fetch from 'node-fetch';
import { Logger } from '../utils/logger.js';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

export class FigmaProvider {
  private accessToken: string;
  private logger: Logger;
  private baseUrl = 'https://api.figma.com/v1';

  constructor() {
    this.logger = new Logger('FigmaProvider');
    
    if (!process.env.FIGMA_ACCESS_TOKEN) {
      throw new Error('FIGMA_ACCESS_TOKEN environment variable is required');
    }
    
    this.accessToken = process.env.FIGMA_ACCESS_TOKEN;
  }

  isHealthy(): boolean {
    return !!this.accessToken;
  }

  async handleRequest(method: string, path: string, body: any) {
    const routes = {
      'GET:/files': () => this.listRecentFiles(),
      'GET:/file': () => this.getFile(body.fileKey),
      'POST:/export': () => this.exportImages(body.fileKey, body.nodeIds, body.format),
      'GET:/components': () => this.getComponents(body.fileKey),
      'GET:/styles': () => this.getStyles(body.fileKey),
    };

    const route = `${method}:${path}`;
    const handler = routes[route as keyof typeof routes];
    
    if (handler) {
      return await handler();
    }
    
    throw new Error(`Figma route not found: ${route}`);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  async getFile(fileKey: string): Promise<any> {
    try {
      this.logger.info(`Getting Figma file: ${fileKey}`);
      
      const data = await this.makeRequest(`/files/${fileKey}`);
      
      return {
        message: `Successfully retrieved Figma file`,
        file: {
          name: data.name,
          lastModified: data.lastModified,
          thumbnailUrl: data.thumbnailUrl,
          version: data.version,
          document: this.processNode(data.document),
          components: data.components,
          styles: data.styles,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get Figma file ${fileKey}:`, error);
      throw error;
    }
  }

  async exportImages(fileKey: string, nodeIds: string[], format: string = 'png'): Promise<any> {
    try {
      this.logger.info(`Exporting images from Figma file: ${fileKey}`);
      
      const params = new URLSearchParams({
        ids: nodeIds.join(','),
        format,
        scale: '2',
      });

      const data = await this.makeRequest(`/images/${fileKey}?${params}`);
      
      if (data.err) {
        throw new Error(`Figma export error: ${data.err}`);
      }

      return {
        message: `Successfully exported ${nodeIds.length} images`,
        images: data.images,
        format,
        scale: 2,
      };
    } catch (error) {
      this.logger.error(`Failed to export images from ${fileKey}:`, error);
      throw error;
    }
  }

  async getComponents(fileKey: string): Promise<any> {
    try {
      this.logger.info(`Getting components from Figma file: ${fileKey}`);
      
      const data = await this.makeRequest(`/files/${fileKey}/components`);
      
      return {
        message: `Successfully retrieved components`,
        components: data.meta.components.map((comp: any) => ({
          key: comp.key,
          name: comp.name,
          description: comp.description,
          componentSetId: comp.component_set_id,
          documentationLinks: comp.documentation_links,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get components from ${fileKey}:`, error);
      throw error;
    }
  }

  async getStyles(fileKey: string): Promise<any> {
    try {
      this.logger.info(`Getting styles from Figma file: ${fileKey}`);
      
      const data = await this.makeRequest(`/files/${fileKey}/styles`);
      
      return {
        message: `Successfully retrieved styles`,
        styles: data.meta.styles.map((style: any) => ({
          key: style.key,
          name: style.name,
          description: style.description,
          styleType: style.style_type,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get styles from ${fileKey}:`, error);
      throw error;
    }
  }

  async listRecentFiles(): Promise<any> {
    try {
      this.logger.info('Getting recent Figma files');
      
      const data = await this.makeRequest('/files/recent');
      
      return {
        message: 'Successfully retrieved recent files',
        files: data.files.map((file: any) => ({
          key: file.key,
          name: file.name,
          thumbnailUrl: file.thumbnail_url,
          lastModified: file.last_modified,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get recent files:', error);
      throw error;
    }
  }

  async searchComponents(fileKey: string, query: string): Promise<any> {
    try {
      this.logger.info(`Searching components in ${fileKey} for: ${query}`);
      
      // Get file data first
      const fileData = await this.getFile(fileKey);
      const components = fileData.file.components;
      
      // Filter components by name matching query
      const matchingComponents = Object.values(components).filter((comp: any) =>
        comp.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        message: `Found ${matchingComponents.length} components matching "${query}"`,
        components: matchingComponents,
        query,
      };
    } catch (error) {
      this.logger.error(`Failed to search components:`, error);
      throw error;
    }
  }

  async getFramesByName(fileKey: string, frameName: string): Promise<any> {
    try {
      this.logger.info(`Getting frames named "${frameName}" from ${fileKey}`);
      
      const fileData = await this.getFile(fileKey);
      const frames = this.findFramesByName(fileData.file.document, frameName);
      
      return {
        message: `Found ${frames.length} frames named "${frameName}"`,
        frames,
        frameName,
      };
    } catch (error) {
      this.logger.error(`Failed to get frames:`, error);
      throw error;
    }
  }

  private processNode(node: any): FigmaNode {
    const processed: FigmaNode = {
      id: node.id,
      name: node.name,
      type: node.type,
    };

    if (node.children && Array.isArray(node.children)) {
      processed.children = node.children.map((child: any) => this.processNode(child));
    }

    return processed;
  }

  private findFramesByName(node: FigmaNode, targetName: string): FigmaNode[] {
    const results: FigmaNode[] = [];
    
    if (node.type === 'FRAME' && node.name.toLowerCase().includes(targetName.toLowerCase())) {
      results.push(node);
    }
    
    if (node.children) {
      for (const child of node.children) {
        results.push(...this.findFramesByName(child, targetName));
      }
    }
    
    return results;
  }

  async getDesignTokens(fileKey: string): Promise<any> {
    try {
      this.logger.info(`Extracting design tokens from ${fileKey}`);
      
      const [styles, components] = await Promise.all([
        this.getStyles(fileKey),
        this.getComponents(fileKey),
      ]);
      
      // Process styles into design tokens format
      const tokens = {
        colors: styles.styles.filter((s: any) => s.styleType === 'FILL'),
        typography: styles.styles.filter((s: any) => s.styleType === 'TEXT'),
        effects: styles.styles.filter((s: any) => s.styleType === 'EFFECT'),
        spacing: styles.styles.filter((s: any) => s.styleType === 'GRID'),
      };
      
      return {
        message: 'Successfully extracted design tokens',
        tokens,
        componentsCount: components.components.length,
        stylesCount: styles.styles.length,
      };
    } catch (error) {
      this.logger.error('Failed to extract design tokens:', error);
      throw error;
    }
  }
}