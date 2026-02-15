import { format } from 'prettier'
import htmlParser from 'prettier/plugins/html'

export async function formatHtmlForReport(html: string): Promise<string> {
    const normalized = html.trim()
    if (!normalized) return ''

    try {
        const output = await format(normalized, {
            parser: 'html',
            plugins: [htmlParser],
            printWidth: 100,
            tabWidth: 2,
            useTabs: true,
            htmlWhitespaceSensitivity: 'ignore',
        })
        return output.trimEnd()
    } catch {
        return normalized
    }
}
