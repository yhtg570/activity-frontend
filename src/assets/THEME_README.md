# 主题与设计规范 (Theme)

本项目已添加统一的主题色并使用 CSS 变量（Design Tokens）维护。请在组件中使用以下变量以保证统一风格：

变量说明：
- `--brand-primary`: 主色 - #83B7E1
- `--brand-accent`: 主色浅色背景/hover - #C8E3F5
- `--bg-soft`: 页面背景 - #FFF6E7
- `--brand-highlight`: 高亮 / 次要操作 - #FCE76F
- `--text-primary`: 主文本色 - #2c3e50
- `--text-muted`: 次要文本色 - #666
- `--border`: 边框颜色 - #dcdfe6
- `--card-bg`: 卡片背景 - #ffffff

公共类：
- `.btn-primary` : 主操作按钮，使用 `--brand-primary`。
- `.btn-secondary` : 次要动作，建议使用 `--brand-highlight`。
- `.btn-danger` / `.btn-success`: 语义颜色样式保留。
- `.card` : 卡片/面板背景和边框。
- `.text-muted` : 次要文本颜色。

组件开发建议：
- 在模板中使用预定义类（例如 `class="btn-primary"`）而不是内联 style。避免在多个组件中复制硬编码颜色。
- 在组件样式中使用 `var(--xxx)` 引用颜色变量，以便统一主题后快速生效。
- 若需要新增颜色，请先在 `src/assets/theme.css` 中添加并命名变量，而不是直接写 hex 值。
