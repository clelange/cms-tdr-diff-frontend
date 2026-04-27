<template>
  <span class="latex-text" v-html="renderedHtml"></span>
</template>

<script setup lang="ts">
import { renderToString } from 'katex'

const props = defineProps<{
  text?: string | null
}>()

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"'
}

const delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false }
]

const decodeHtmlEntities = (value: string) =>
  import.meta.client
    ? decodeHtmlEntitiesInBrowser(value)
    : value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
        const normalized = code.toLowerCase()
        if (normalized.startsWith('#x')) {
          return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16))
        }
        if (normalized.startsWith('#')) {
          return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10))
        }
        return namedEntities[normalized] || entity
      })

let entityDecoder: HTMLTextAreaElement | null = null

const decodeHtmlEntitiesInBrowser = (value: string) => {
  entityDecoder ||= document.createElement('textarea')
  entityDecoder.innerHTML = value
  return entityDecoder.value
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeLatex = (value: string) =>
  value.replace(/\\\\([A-Za-z])/g, (_match, command: string) => `\\${command}`)

const renderMath = (value: string, displayMode: boolean, left: string, right: string) => {
  const latex = normalizeLatex(value)
  try {
    return renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false
    })
  } catch {
    return escapeHtml(`${left}${value}${right}`)
  }
}

const renderText = (value: string) => {
  let cursor = 0
  let html = ''

  while (cursor < value.length) {
    const next = delimiters
      .map(delimiter => ({
        ...delimiter,
        start: value.indexOf(delimiter.left, cursor)
      }))
      .filter(delimiter => delimiter.start >= 0)
      .sort((a, b) => a.start - b.start || b.left.length - a.left.length)[0]

    if (!next) {
      html += escapeHtml(value.slice(cursor))
      break
    }

    const mathStart = next.start + next.left.length
    const mathEnd = value.indexOf(next.right, mathStart)
    if (mathEnd < 0) {
      html += escapeHtml(value.slice(cursor))
      break
    }

    html += escapeHtml(value.slice(cursor, next.start))
    html += renderMath(value.slice(mathStart, mathEnd), next.display, next.left, next.right)
    cursor = mathEnd + next.right.length
  }

  return html
}

const renderedHtml = computed(() => renderText(decodeHtmlEntities(props.text || '')))
</script>
