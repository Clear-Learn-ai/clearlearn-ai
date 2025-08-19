import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../utils/logger.js';

export class FilesystemProvider {
  private logger: Logger;
  private projectRoot: string;
  private allowedExtensions: Set<string>;
  private blockedPaths: Set<string>;

  constructor() {
    this.logger = new Logger('FilesystemProvider');
    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    
    // Define allowed file extensions for security
    this.allowedExtensions = new Set([
      '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt',
      '.css', '.scss', '.html', '.yml', '.yaml', '.env',
      '.gitignore', '.prettierrc', '.eslintrc', '.config',
      '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico'
    ]);
    
    // Define blocked paths for security
    this.blockedPaths = new Set([
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      '.env',
      '.env.local',
      '.env.production'
    ]);
  }

  isHealthy(): boolean {
    return true; // Filesystem is always available
  }

  async handleRequest(method: string, path: string, body: any) {
    const routes = {
      'GET:/read': () => this.readFile(body.path),
      'POST:/write': () => this.writeFile(body.path, body.content),
      'GET:/list': () => this.listDirectory(body.path || '.'),
      'POST:/create-dir': () => this.createDirectory(body.path),
      'DELETE:/delete': () => this.deleteFile(body.path),
      'GET:/stats': () => this.getFileStats(body.path),
      'GET:/search': () => this.searchFiles(body.query, body.path || '.'),
    };

    const route = `${method}:${path}`;
    const handler = routes[route as keyof typeof routes];
    
    if (handler) {
      return await handler();
    }
    
    throw new Error(`Filesystem route not found: ${route}`);
  }

  private validatePath(filePath: string): string {
    // Resolve the absolute path
    const fullPath = path.resolve(this.projectRoot, filePath);
    
    // Ensure the path is within the project root
    if (!fullPath.startsWith(path.resolve(this.projectRoot))) {
      throw new Error('Access denied: Path is outside project root');
    }
    
    // Check for blocked paths
    const relativePath = path.relative(this.projectRoot, fullPath);
    const pathParts = relativePath.split(path.sep);
    
    for (const part of pathParts) {
      if (this.blockedPaths.has(part)) {
        throw new Error(`Access denied: ${part} is a blocked directory`);
      }
    }
    
    return fullPath;
  }

  private validateFileExtension(filePath: string): void {
    const ext = path.extname(filePath).toLowerCase();
    if (ext && !this.allowedExtensions.has(ext)) {
      throw new Error(`Access denied: ${ext} files are not allowed`);
    }
  }

  async readFile(filePath: string): Promise<any> {
    try {
      this.logger.info(`Reading file: ${filePath}`);
      
      const fullPath = this.validatePath(filePath);
      this.validateFileExtension(fullPath);
      
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      return {
        content,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        message: `Successfully read ${filePath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to read file ${filePath}:`, error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<any> {
    try {
      this.logger.info(`Writing file: ${filePath}`);
      
      const fullPath = this.validatePath(filePath);
      this.validateFileExtension(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      return {
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        message: `Successfully wrote ${filePath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to write file ${filePath}:`, error);
      throw error;
    }
  }

  async listDirectory(dirPath: string = '.'): Promise<any> {
    try {
      this.logger.info(`Listing directory: ${dirPath}`);
      
      const fullPath = this.validatePath(dirPath);
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      
      const files = [];
      const directories = [];
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        // Skip blocked paths
        if (this.blockedPaths.has(item.name)) {
          continue;
        }
        
        const stats = await fs.stat(path.join(fullPath, item.name));
        const itemInfo = {
          name: item.name,
          path: itemPath,
          size: stats.size,
          modified: stats.mtime,
          type: item.isDirectory() ? 'directory' : 'file',
        };
        
        if (item.isDirectory()) {
          directories.push(itemInfo);
        } else {
          // Only include allowed file types
          const ext = path.extname(item.name).toLowerCase();
          if (!ext || this.allowedExtensions.has(ext)) {
            files.push(itemInfo);
          }
        }
      }
      
      return {
        path: dirPath,
        directories: directories.sort((a, b) => a.name.localeCompare(b.name)),
        files: files.sort((a, b) => a.name.localeCompare(b.name)),
        totalItems: directories.length + files.length,
        message: `Successfully listed ${dirPath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to list directory ${dirPath}:`, error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<any> {
    try {
      this.logger.info(`Creating directory: ${dirPath}`);
      
      const fullPath = this.validatePath(dirPath);
      await fs.mkdir(fullPath, { recursive: true });
      
      return {
        path: dirPath,
        message: `Successfully created directory ${dirPath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to create directory ${dirPath}:`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<any> {
    try {
      this.logger.info(`Deleting file: ${filePath}`);
      
      const fullPath = this.validatePath(filePath);
      this.validateFileExtension(fullPath);
      
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        throw new Error('Cannot delete directories for security reasons');
      }
      
      await fs.unlink(fullPath);
      
      return {
        path: filePath,
        message: `Successfully deleted ${filePath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}:`, error);
      throw error;
    }
  }

  async getFileStats(filePath: string): Promise<any> {
    try {
      this.logger.info(`Getting stats for: ${filePath}`);
      
      const fullPath = this.validatePath(filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode.toString(8),
        message: `Successfully got stats for ${filePath}`,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for ${filePath}:`, error);
      throw error;
    }
  }

  async searchFiles(query: string, searchPath: string = '.'): Promise<any> {
    try {
      this.logger.info(`Searching for "${query}" in ${searchPath}`);
      
      const fullPath = this.validatePath(searchPath);
      const results = await this.searchRecursive(fullPath, query, searchPath);
      
      return {
        query,
        searchPath,
        results: results.slice(0, 50), // Limit results for performance
        totalFound: results.length,
        message: `Found ${results.length} matches for "${query}"`,
      };
    } catch (error) {
      this.logger.error(`Failed to search for "${query}":`, error);
      throw error;
    }
  }

  private async searchRecursive(fullPath: string, query: string, relativePath: string): Promise<any[]> {
    const results = [];
    
    try {
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const item of items) {
        // Skip blocked paths
        if (this.blockedPaths.has(item.name)) {
          continue;
        }
        
        const itemFullPath = path.join(fullPath, item.name);
        const itemRelativePath = path.join(relativePath, item.name);
        
        if (item.isDirectory()) {
          // Recursively search subdirectories
          const subResults = await this.searchRecursive(itemFullPath, query, itemRelativePath);
          results.push(...subResults);
        } else {
          // Check if filename matches
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            const stats = await fs.stat(itemFullPath);
            results.push({
              name: item.name,
              path: itemRelativePath,
              type: 'filename',
              size: stats.size,
              modified: stats.mtime,
            });
          }
          
          // Check file content for text files
          const ext = path.extname(item.name).toLowerCase();
          if (this.allowedExtensions.has(ext) && ['.ts', '.tsx', '.js', '.jsx', '.md', '.txt', '.json'].includes(ext)) {
            try {
              const content = await fs.readFile(itemFullPath, 'utf-8');
              if (content.toLowerCase().includes(query.toLowerCase())) {
                const stats = await fs.stat(itemFullPath);
                results.push({
                  name: item.name,
                  path: itemRelativePath,
                  type: 'content',
                  size: stats.size,
                  modified: stats.mtime,
                });
              }
            } catch (contentError) {
              // Skip files that can't be read as text
            }
          }
        }
      }
    } catch (dirError) {
      // Skip directories that can't be read
    }
    
    return results;
  }

  async getProjectStructure(maxDepth: number = 3): Promise<any> {
    try {
      this.logger.info(`Getting project structure (max depth: ${maxDepth})`);
      
      const structure = await this.buildStructure(this.projectRoot, '.', 0, maxDepth);
      
      return {
        structure,
        maxDepth,
        message: 'Successfully built project structure',
      };
    } catch (error) {
      this.logger.error('Failed to get project structure:', error);
      throw error;
    }
  }

  private async buildStructure(fullPath: string, relativePath: string, currentDepth: number, maxDepth: number): Promise<any> {
    if (currentDepth >= maxDepth) {
      return null;
    }
    
    try {
      const stats = await fs.stat(fullPath);
      
      if (stats.isFile()) {
        const ext = path.extname(relativePath).toLowerCase();
        if (!ext || this.allowedExtensions.has(ext)) {
          return {
            name: path.basename(relativePath),
            type: 'file',
            path: relativePath,
            size: stats.size,
          };
        }
        return null;
      }
      
      if (stats.isDirectory()) {
        const dirName = path.basename(relativePath);
        
        // Skip blocked directories
        if (this.blockedPaths.has(dirName)) {
          return null;
        }
        
        const items = await fs.readdir(fullPath, { withFileTypes: true });
        const children = [];
        
        for (const item of items) {
          const itemFullPath = path.join(fullPath, item.name);
          const itemRelativePath = path.join(relativePath, item.name);
          
          const child = await this.buildStructure(itemFullPath, itemRelativePath, currentDepth + 1, maxDepth);
          if (child) {
            children.push(child);
          }
        }
        
        return {
          name: dirName || 'root',
          type: 'directory',
          path: relativePath,
          children: children.sort((a, b) => {
            // Directories first, then files
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          }),
        };
      }
    } catch (error) {
      // Skip items that can't be accessed
      return null;
    }
    
    return null;
  }
}