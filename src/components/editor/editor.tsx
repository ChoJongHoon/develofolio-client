import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { CustomElement } from './elements'
import { withIcon } from './elements/icon'
import { withMarkdown } from './elements/markdown'
import { HoveringToolbar } from './hovering-toolbar'
import { renderLeaf, toggleFormat } from './elements/format'
import { css } from '@emotion/react'
import { withNodeId } from './node-id/with-node-id'
import { nanoid } from 'nanoid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export function Editor() {
	const editor = useMemo(
		() =>
			withHistory(
				withReact(withIcon(withMarkdown(withNodeId(createEditor()))))
			),
		[]
	)

	const [value, setValue] = useState<Descendant[]>([
		{
			key: nanoid(),
			type: 'heading-one',
			children: [{ key: nanoid(), text: '이채영 (@Luna Lee)' }],
		},
		{
			key: nanoid(),
			type: 'paragraph',
			children: [
				{ key: nanoid(), text: '안녕하세요 프론트엔드 엔지니어 이채영입니다.' },
			],
		},
		{
			key: nanoid(),
			type: 'bulleted-list',
			children: [
				{
					key: nanoid(),
					type: 'list-item',
					children: [
						{ key: nanoid(), text: '' },
						{
							key: nanoid(),
							type: 'icon',
							name: 'React',
							shortname: 'react',
							url: 'https://facebook.github.io/react/',
							file: 'react.svg',
							children: [{ text: '' }],
						},
						{ key: nanoid(), text: ' React' },
					],
				},
				{
					key: nanoid(),
					type: 'list-item',
					children: [
						{ key: nanoid(), text: '' },
						{
							key: nanoid(),
							type: 'icon',
							name: 'Apollo',
							shortname: 'apollostack',
							url: 'http://www.apollostack.com/',
							file: 'apollostack.svg',
							children: [{ text: '' }],
						},
						{ key: nanoid(), text: ' Apollo client' },
					],
				},
				{
					key: nanoid(),
					type: 'list-item',
					children: [
						{ key: nanoid(), text: '' },
						{
							key: nanoid(),
							type: 'icon',
							name: 'Typescript',
							shortname: 'typescript',
							url: 'https://www.typescriptlang.org/',
							file: 'typescript-icon.svg',
							children: [{ text: '' }],
						},
						{ key: nanoid(), text: ' TypeScript' },
					],
				},
				{
					key: nanoid(),
					type: 'list-item',
					children: [
						{ key: nanoid(), text: '' },
						{
							key: nanoid(),
							type: 'icon',
							name: 'GraphQL',
							shortname: 'graphql',
							url: 'http://graphql.org/',
							file: 'graphql.svg',
							children: [{ text: '' }],
						},
						{ key: nanoid(), text: ' GraphQL' },
					],
				},
			],
		},
		{
			key: nanoid(),
			type: 'paragraph',
			children: [{ key: nanoid(), text: '' }],
		},
	])

	const onChnage = useCallback(
		(newValue: Descendant[]) => setValue(newValue),
		[]
	)
	console.log(`value`, value)
	return (
		<DndProvider backend={HTML5Backend}>
			<Slate editor={editor} value={value} onChange={onChnage}>
				<HoveringToolbar />
				<Editable
					renderElement={CustomElement}
					renderLeaf={renderLeaf}
					spellCheck={false}
					onDOMBeforeInput={(event) => {
						switch (event.inputType) {
							case 'formatBold':
								event.preventDefault()
								return toggleFormat(editor, 'bold')
							case 'formatItalic':
								event.preventDefault()
								return toggleFormat(editor, 'italic')
						}
					}}
					css={editorStyles}
				/>
			</Slate>
		</DndProvider>
	)
}

const editorStyles = css`
	padding: 32px;

	[data-slate-node='element'] > * {
		vertical-align: middle;
	}
`
