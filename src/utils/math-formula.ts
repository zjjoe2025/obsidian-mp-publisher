/**
 * 数学公式处理工具
 * 支持 LaTeX 公式的预处理
 */

/**
 * 预处理 Markdown 内容，转换 LaTeX 语法为 Obsidian 支持的 $ 语法
 */
export function preprocessMathFormula(markdown: string): string {
    let processed = markdown;

    // 保护代码块，避免误转换其中的 LaTeX 语法
    const codeBlockMap = new Map<string, string>();
    let codeBlockId = 0;

    // 保护围栏代码块和行内代码
    processed = processed.replace(/```[\s\S]*?```|`[^`\n]+?`/g, (match) => {
        const id = `__CODE_BLOCK_${codeBlockId++}__`;
        codeBlockMap.set(id, match);
        return id;
    });

    // \[...\] -> $$...$$ (块级公式)
    processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => `$$${tex}$$`);

    // \(...\) -> $...$ (行内公式)
    processed = processed.replace(/\\\(([^\n]+?)\\\)/g, (_, tex) => `$${tex}$`);

    // 恢复代码块
    codeBlockMap.forEach((code, id) => {
        processed = processed.replace(id, () => code);
    });

    return processed;
}

/**
 * 等待异步渲染完成（MathJax 等）
 */
export async function waitForAsyncRender(el: HTMLElement, maxWait = 3000): Promise<void> {
    const hasMath = el.querySelector('.math, .math-inline, .math-block');
    if (!hasMath) return;

    const start = Date.now();
    while (Date.now() - start < maxWait) {
        const processed = el.querySelectorAll('mjx-container');
        if (processed.length > 0) return;
        await new Promise(r => setTimeout(r, 100));
    }
}

/**
 * 将 MathJax 公式转换为内联 SVG
 * 直接序列化 MathJax 渲染的 SVG，确保微信公众号兼容
 */
export async function convertMathToSVG(htmlContent: string, markdown: string): Promise<string> {
    if (!markdown) return htmlContent;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 查找所有 MathJax 容器
    const containers = Array.from(doc.querySelectorAll('mjx-container'))
        .filter(el => !el.parentElement?.closest('mjx-container'));

    if (containers.length === 0) return htmlContent;

    for (const container of containers) {
        const isBlock = container.getAttribute('display') === 'true' ||
                        container.closest('.math-block') !== null;

        // 获取内部的 SVG
        const svg = container.querySelector('svg');
        if (!svg) continue;

        // 克隆 SVG 并设置属性
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // 序列化 SVG
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgClone);

        // 创建图片元素
        const img = doc.createElement('img');
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        img.setAttribute('src', dataUrl);
        img.setAttribute('alt', 'formula');

        if (isBlock) {
            img.style.cssText = 'display:block;margin:1em auto;max-width:100%;';
        } else {
            img.style.cssText = 'vertical-align:middle;max-width:100%;';
        }

        // 替换容器
        container.replaceWith(img);
    }

    return doc.body.innerHTML;
}