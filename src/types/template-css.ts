/**
 * 模板 CSS 自定义样式类型定义
 * 参考 mdnice 的样式系统设计
 */

/**
 * CSS 样式片段接口
 */
export interface CSSSnippet {
    id: string;
    name: string;
    description: string;
    css: string;
    isEnabled: boolean;
}

/**
 * 模板自定义 CSS 配置
 */
export interface TemplateCustomCSS {
    /** 是否启用自定义 CSS */
    enabled: boolean;
    /** 自定义 CSS 代码 */
    customCSS: string;
    /** CSS 变量覆盖 */
    cssVariables: Record<string, string>;
    /** 额外的 CSS 类名 */
    extraClassName: string;
}

/**
 * 默认的 CSS 变量定义
 * 参考 mdnice 的主题变量系统
 */
export const DEFAULT_CSS_VARIABLES: Record<string, { default: string; description: string }> = {
    '--primary-color': { default: '#2c3e50', description: '主题主色' },
    '--secondary-color': { default: '#34495e', description: '主题次色' },
    '--accent-color': { default: '#3498db', description: '强调色' },
    '--text-color': { default: '#4a4a4a', description: '正文文字颜色' },
    '--heading-color': { default: '#2c3e50', description: '标题颜色' },
    '--link-color': { default: '#3498db', description: '链接颜色' },
    '--code-bg': { default: '#f8f8f8', description: '代码块背景色' },
    '--code-color': { default: '#333', description: '代码块文字颜色' },
    '--quote-bg': { default: '#f6f8fa', description: '引用块背景色' },
    '--quote-border': { default: '#e0e0e0', description: '引用块边框颜色' },
    '--table-header-bg': { default: '#f6f8fa', description: '表格头部背景色' },
    '--table-border': { default: '#e1e4e8', description: '表格边框颜色' },
    '--hr-color': { default: '#f0f0f0', description: '分隔线颜色' },
    '--bg-color': { default: '#ffffff', description: '页面背景色' },
    '--line-height': { default: '1.8', description: '行高' },
    '--font-size': { default: '16px', description: '基础字体大小' },
};

/**
 * CSS 选择器映射
 * 用于将模板样式映射到 CSS 选择器
 */
export const CSS_SELECTOR_MAP: Record<string, string> = {
    'container': '.mp-content',
    'h1': '.mp-content h1',
    'h2': '.mp-content h2',
    'h3': '.mp-content h3',
    'h4': '.mp-content h4',
    'h5': '.mp-content h5',
    'h6': '.mp-content h6',
    'paragraph': '.mp-content p',
    'list': '.mp-content ul, .mp-content ol',
    'listItem': '.mp-content li',
    'taskList': '.mp-content .task-list-item',
    'codeBlock': '.mp-content pre',
    'inlineCode': '.mp-content code:not(pre code)',
    'quote': '.mp-content blockquote',
    'link': '.mp-content a',
    'image': '.mp-content img',
    'table': '.mp-content table',
    'tableHeader': '.mp-content th',
    'tableCell': '.mp-content td',
    'hr': '.mp-content hr',
    'strong': '.mp-content strong',
    'em': '.mp-content em',
    'del': '.mp-content del',
    'footnote': '.mp-content .footnote-ref',
    'footnoteBackref': '.mp-content .footnote-backref',
};

/**
 * 生成默认的自定义 CSS 模板
 */
export function generateDefaultCustomCSS(): string {
    return `/* 自定义 CSS 样式 */
/* 参考 mdnice 的样式系统 */

/* ==================== 基础变量 ==================== */
:root {
  /* 主题色彩 */
  --primary-color: #2c3e50;
  --secondary-color: #34495e;
  --accent-color: #3498db;
  
  /* 文字颜色 */
  --text-color: #4a4a4a;
  --heading-color: #2c3e50;
  --link-color: #3498db;
  
  /* 代码样式 */
  --code-bg: #f8f8f8;
  --code-color: #333;
  
  /* 引用块 */
  --quote-bg: #f6f8fa;
  --quote-border: #e0e0e0;
  
  /* 表格 */
  --table-header-bg: #f6f8fa;
  --table-border: #e1e4e8;
  
  /* 其他 */
  --hr-color: #f0f0f0;
  --bg-color: #ffffff;
  
  /* 排版 */
  --line-height: 1.8;
  --font-size: 16px;
}

/* ==================== 全局样式 ==================== */
.mp-content {
  font-size: var(--font-size);
  line-height: var(--line-height);
  color: var(--text-color);
  background-color: var(--bg-color);
}

/* ==================== 标题样式 ==================== */
.mp-content h1 {
  color: var(--heading-color);
  font-size: 2em;
  margin: 32px 0 16px;
  font-weight: bold;
  letter-spacing: -0.02em;
}

.mp-content h2 {
  color: var(--heading-color);
  font-size: 1.5em;
  margin: 28px 0 14px;
  font-weight: bold;
  letter-spacing: -0.01em;
}

.mp-content h3 {
  color: var(--heading-color);
  font-size: 1.25em;
  margin: 24px 0 12px;
  font-weight: bold;
}

/* ==================== 段落样式 ==================== */
.mp-content p {
  margin: 1em 0;
  line-height: var(--line-height);
}

/* ==================== 链接样式 ==================== */
.mp-content a {
  color: var(--link-color);
  text-decoration: none;
  border-bottom: 1px solid var(--link-color);
  transition: all 0.3s ease;
}

.mp-content a:hover {
  opacity: 0.8;
}

/* ==================== 代码样式 ==================== */
.mp-content pre {
  background: var(--code-bg);
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
}

.mp-content code:not(pre code) {
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--code-color);
}

/* ==================== 引用块样式 ==================== */
.mp-content blockquote {
  border-left: 4px solid var(--quote-border);
  background: var(--quote-bg);
  padding: 16px 20px;
  margin: 1em 0;
  border-radius: 0 6px 6px 0;
  font-style: italic;
}

/* ==================== 列表样式 ==================== */
.mp-content ul,
.mp-content ol {
  padding-left: 2em;
  margin: 1em 0;
}

.mp-content li {
  margin: 0.5em 0;
}

/* ==================== 表格样式 ==================== */
.mp-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 1px solid var(--table-border);
}

.mp-content th {
  background: var(--table-header-bg);
  padding: 12px;
  border: 1px solid var(--table-border);
  font-weight: bold;
}

.mp-content td {
  padding: 12px;
  border: 1px solid var(--table-border);
}

/* ==================== 分隔线样式 ==================== */
.mp-content hr {
  border: none;
  border-top: 1px solid var(--hr-color);
  margin: 2em 0;
}

/* ==================== 图片样式 ==================== */
.mp-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: 8px;
}

/* ==================== 强调样式 ==================== */
.mp-content strong {
  font-weight: bold;
  color: var(--heading-color);
}

.mp-content em {
  font-style: italic;
}

.mp-content del {
  text-decoration: line-through;
  opacity: 0.6;
}
`;
}

/**
 * 验证 CSS 代码是否合法
 */
export function validateCSS(css: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 基本语法检查
    const openBraces = (css.match(/\{/g) || []).length;
    const closeBraces = (css.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        errors.push('CSS 大括号不匹配，请检查是否有遗漏的 { 或 }');
    }
    
    // 检查是否有未闭合的注释
    const openComments = (css.match(/\/\*/g) || []).length;
    const closeComments = (css.match(/\*\//g) || []).length;
    
    if (openComments !== closeComments) {
        errors.push('CSS 注释未正确闭合，请检查 /* 和 */ 是否配对');
    }
    
    return { valid: errors.length === 0, errors };
}

/**
 * 提取 CSS 变量
 */
export function extractCSSVariables(css: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let match;
    
    while ((match = regex.exec(css)) !== null) {
        variables[`--${match[1]}`] = match[2].trim();
    }
    
    return variables;
}
