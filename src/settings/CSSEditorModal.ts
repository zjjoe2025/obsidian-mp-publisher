import { App, Modal, Setting, Notice, ButtonComponent } from 'obsidian';
import { TemplateCustomCSS, generateDefaultCustomCSS, validateCSS, extractCSSVariables, DEFAULT_CSS_VARIABLES } from '../types/template-css';

/**
 * CSS 编辑器模态框
 * 提供类似 mdnice 的 CSS 自定义编辑功能
 */
export class CSSEditorModal extends Modal {
    private customCSS: TemplateCustomCSS;
    private onSubmit: (customCSS: TemplateCustomCSS) => void;
    private cssEditor: HTMLTextAreaElement;
    private previewContainer: HTMLElement;
    private variableInputs: Map<string, HTMLInputElement> = new Map();
    private isPreviewVisible = false;
    private lineNumbersEl: HTMLElement;

    constructor(
        app: App,
        customCSS: TemplateCustomCSS | undefined,
        onSubmit: (customCSS: TemplateCustomCSS) => void
    ) {
        super(app);
        this.onSubmit = onSubmit;
        
        // 初始化 customCSS，确保有默认值
        if (customCSS) {
            this.customCSS = {
                enabled: customCSS.enabled,
                customCSS: customCSS.customCSS || generateDefaultCustomCSS(),
                cssVariables: customCSS.cssVariables || {},
                extraClassName: customCSS.extraClassName || ''
            };
        } else {
            this.customCSS = {
                enabled: false,
                customCSS: generateDefaultCustomCSS(),
                cssVariables: {},
                extraClassName: ''
            };
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('mp-css-editor-modal');

        // 创建头部
        this.createHeader(contentEl);

        // 创建主内容区域（左右分栏）
        const mainContainer = contentEl.createDiv('css-editor-main');
        
        // 左侧：CSS 编辑器
        const editorPanel = mainContainer.createDiv('css-editor-panel');
        this.createEditorPanel(editorPanel);

        // 右侧：变量设置和预览
        const settingsPanel = mainContainer.createDiv('css-settings-panel');
        this.createSettingsPanel(settingsPanel);

        // 创建底部按钮
        this.createFooter(contentEl);
    }

    private createHeader(container: HTMLElement) {
        const header = container.createDiv('css-editor-header');
        header.createEl('h2', { text: '自定义 CSS 编辑器' });
        
        const subtitle = header.createEl('p', { 
            text: '使用 CSS 完全自定义模板样式，支持 CSS 变量和实时预览',
            cls: 'css-editor-subtitle'
        });

        // 启用/禁用开关
        new Setting(header)
            .setName('启用自定义 CSS')
            .setDesc('启用后将覆盖默认样式设置')
            .addToggle(toggle => {
                toggle.setValue(this.customCSS.enabled)
                    .onChange(value => {
                        this.customCSS.enabled = value;
                        this.updateEditorState();
                    });
            });
    }

    private createEditorPanel(container: HTMLElement) {
        // 编辑器工具栏
        const toolbar = container.createDiv('css-editor-toolbar');
        
        // 重置按钮
        new ButtonComponent(toolbar)
            .setButtonText('重置为默认')
            .setTooltip('恢复默认 CSS 模板')
            .onClick(() => {
                new Notice('已重置为默认 CSS');
                this.cssEditor.value = generateDefaultCustomCSS();
                this.updateLineNumbers(this.lineNumbersEl);
                this.updatePreview();
            });

        // 格式化按钮
        new ButtonComponent(toolbar)
            .setButtonText('格式化')
            .setTooltip('格式化 CSS 代码')
            .onClick(() => {
                this.formatCSS();
            });

        // 验证按钮
        new ButtonComponent(toolbar)
            .setButtonText('验证')
            .setTooltip('验证 CSS 语法')
            .onClick(() => {
                this.validateAndShowErrors();
            });

        // 编辑器主体区域（包含行号和文本框）
        const editorBody = container.createDiv('css-editor-body');
        
        // 行号显示
        this.lineNumbersEl = editorBody.createDiv('css-line-numbers');
        this.updateLineNumbers(this.lineNumbersEl);
        
        // CSS 编辑器
        this.cssEditor = editorBody.createEl('textarea', {
            cls: 'css-editor-textarea',
            attr: {
                placeholder: '在此输入自定义 CSS 代码...',
                spellcheck: false
            }
        });
        this.cssEditor.value = this.customCSS.customCSS;
        
        // 实时更新预览和行号
        this.cssEditor.addEventListener('input', () => {
            this.updateLineNumbers(this.lineNumbersEl);
            this.debounceUpdatePreview();
        });
        
        this.cssEditor.addEventListener('scroll', () => {
            this.lineNumbersEl.scrollTop = this.cssEditor.scrollTop;
        });
    }

    private createSettingsPanel(container: HTMLElement) {
        // CSS 变量设置
        const variablesSection = container.createDiv('css-variables-section');
        variablesSection.createEl('h3', { text: 'CSS 变量' });
        variablesSection.createEl('p', { 
            text: '快速调整主题色彩',
            cls: 'section-description'
        });

        const variablesContainer = variablesSection.createDiv('css-variables-container');
        
        // 为每个默认变量创建输入
        Object.entries(DEFAULT_CSS_VARIABLES).forEach(([varName, config]) => {
            const currentValue = this.customCSS.cssVariables[varName] || config.default;
            
            new Setting(variablesContainer)
                .setName(varName)
                .setDesc(config.description)
                .addText(text => {
                    text.setValue(currentValue)
                        .onChange(value => {
                            this.customCSS.cssVariables[varName] = value;
                            this.updateCSSVariable(varName, value);
                        });
                    this.variableInputs.set(varName, text.inputEl);
                });
        });

        // 额外类名设置
        new Setting(container)
            .setName('额外 CSS 类名')
            .setDesc('为模板内容添加额外的 CSS 类名')
            .addText(text => {
                text.setValue(this.customCSS.extraClassName)
                    .onChange(value => {
                        this.customCSS.extraClassName = value;
                    });
            });

        // 预览区域
        const previewSection = container.createDiv('css-preview-section');
        previewSection.createEl('h3', { text: '实时预览' });
        
        const previewToggle = new Setting(previewSection)
            .setName('显示预览')
            .addToggle(toggle => {
                toggle.setValue(this.isPreviewVisible)
                    .onChange(value => {
                        this.isPreviewVisible = value;
                        previewContainer.toggle(value);
                        if (value) {
                            this.updatePreview();
                        }
                    });
            });

        const previewContainer = previewSection.createDiv('css-preview-container');
        previewContainer.hide();
        this.previewContainer = previewContainer;

        // 创建预览内容
        this.createPreviewContent(previewContainer);
    }

    private createPreviewContent(container: HTMLElement) {
        const previewContent = container.createDiv('mp-content css-preview-content');
        
        // 标题
        previewContent.createEl('h1', { text: '一级标题示例' });
        previewContent.createEl('h2', { text: '二级标题示例' });
        previewContent.createEl('h3', { text: '三级标题示例' });
        
        // 段落
        const p1 = previewContent.createEl('p');
        p1.createEl('span', { text: '这是一个段落示例，包含' });
        p1.createEl('strong', { text: '粗体文字' });
        p1.createEl('span', { text: '和' });
        p1.createEl('em', { text: '斜体文字' });
        p1.createEl('span', { text: '。' });
        
        // 链接
        const link = previewContent.createEl('a', { 
            text: '这是一个链接',
            attr: { href: '#' }
        });
        
        // 列表
        const list = previewContent.createEl('ul');
        list.createEl('li', { text: '列表项 1' });
        list.createEl('li', { text: '列表项 2' });
        list.createEl('li', { text: '列表项 3' });
        
        // 引用
        const quote = previewContent.createEl('blockquote');
        quote.createEl('p', { text: '这是一段引用文本，用于展示引用块的样式效果。' });
        
        // 代码
        const code = previewContent.createEl('pre');
        code.createEl('code', { text: 'console.log("Hello World");' });
        
        // 内联代码
        const p2 = previewContent.createEl('p');
        p2.createEl('span', { text: '这是内联代码示例：' });
        p2.createEl('code', { text: 'const x = 1;' });
        
        // 表格
        const table = previewContent.createEl('table');
        const thead = table.createEl('thead');
        const tr1 = thead.createEl('tr');
        tr1.createEl('th', { text: '表头 1' });
        tr1.createEl('th', { text: '表头 2' });
        const tbody = table.createEl('tbody');
        const tr2 = tbody.createEl('tr');
        tr2.createEl('td', { text: '单元格 1' });
        tr2.createEl('td', { text: '单元格 2' });
        
        // 分隔线
        previewContent.createEl('hr');
        
        // 图片占位
        const imgContainer = previewContent.createEl('p');
        const img = imgContainer.createEl('img', {
            attr: {
                src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100"%3E%3Crect fill="%23ddd" width="200" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片示例%3C/text%3E%3C/svg%3E',
                alt: '图片示例'
            }
        });
    }

    private createFooter(container: HTMLElement) {
        const footer = container.createDiv('css-editor-footer');
        
        new Setting(footer)
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => this.close()))
            .addButton(btn => btn
                .setButtonText('保存')
                .setCta()
                .onClick(() => {
                    this.saveAndClose();
                }));
    }

    private updateEditorState() {
        const isEnabled = this.customCSS.enabled;
        
        // 启用/禁用编辑器
        this.cssEditor.disabled = !isEnabled;
        this.cssEditor.toggleClass('disabled', !isEnabled);
        
        // 启用/禁用行号
        this.lineNumbersEl.toggleClass('disabled', !isEnabled);
        
        // 显示/隐藏主内容区域
        const mainContainer = this.contentEl.querySelector('.css-editor-main') as HTMLElement;
        if (mainContainer) {
            mainContainer.toggleClass('css-editor-disabled', !isEnabled);
        }
    }

    private updateLineNumbers(container: HTMLElement) {
        const lines = this.cssEditor.value.split('\n').length;
        container.empty();
        for (let i = 1; i <= lines; i++) {
            container.createDiv('line-number').setText(String(i));
        }
    }

    private debounceTimer: number | null = null;
    private debounceUpdatePreview() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = window.setTimeout(() => {
            this.updatePreview();
        }, 300);
    }

    private updatePreview() {
        if (!this.isPreviewVisible || !this.previewContainer) return;

        const css = this.cssEditor.value;
        this.customCSS.customCSS = css;

        // 移除旧的样式标签
        const oldStyle = this.previewContainer.querySelector('style[data-preview-css]');
        if (oldStyle) {
            oldStyle.remove();
        }

        // 添加新的样式标签
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-preview-css', 'true');
        styleEl.textContent = css;
        this.previewContainer.appendChild(styleEl);

        // 更新 CSS 变量输入框
        const variables = extractCSSVariables(css);
        Object.entries(variables).forEach(([varName, value]) => {
            const input = this.variableInputs.get(varName);
            if (input && input.value !== value) {
                input.value = value;
                this.customCSS.cssVariables[varName] = value;
            }
        });
    }

    private updateCSSVariable(varName: string, value: string) {
        let css = this.cssEditor.value;
        const regex = new RegExp(`(${varName}\\s*:\\s*)[^;]+;`, 'g');
        
        if (regex.test(css)) {
            css = css.replace(regex, `$1${value};`);
        } else {
            // 如果在 :root 中不存在，添加它
            const rootRegex = /(:root\\s*\\{[^}]*)/;
            if (rootRegex.test(css)) {
                css = css.replace(rootRegex, `$1  ${varName}: ${value};\\n  `);
            }
        }
        
        this.cssEditor.value = css;
        this.updatePreview();
    }

    private formatCSS() {
        let css = this.cssEditor.value;
        
        // 简单的格式化：统一缩进和换行
        css = css
            .replace(/\\s*\\{\\s*/g, ' {\\n  ')
            .replace(/;\\s*/g, ';\\n  ')
            .replace(/\\s*\\}\\s*/g, '\\n}\\n')
            .replace(/\\n\\s*\\n/g, '\\n')
            .trim();
        
        this.cssEditor.value = css;
        this.updateLineNumbers(this.cssEditor.parentElement!.querySelector('.css-line-numbers') as HTMLElement);
        new Notice('CSS 已格式化');
    }

    private validateAndShowErrors() {
        const css = this.cssEditor.value;
        const result = validateCSS(css);
        
        if (result.valid) {
            new Notice('✓ CSS 语法验证通过');
        } else {
            result.errors.forEach(error => {
                new Notice('✗ ' + error, 5000);
            });
        }
        
        return result.valid;
    }

    private saveAndClose() {
        // 验证 CSS
        if (this.customCSS.enabled) {
            const result = validateCSS(this.cssEditor.value);
            if (!result.valid) {
                result.errors.forEach(error => {
                    new Notice('✗ ' + error, 5000);
                });
                return;
            }
        }

        // 更新自定义 CSS
        this.customCSS.customCSS = this.cssEditor.value;
        
        // 提交
        this.onSubmit(this.customCSS);
        this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
