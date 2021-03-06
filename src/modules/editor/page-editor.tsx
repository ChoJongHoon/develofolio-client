import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createEditor, Descendant, Editor, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { HoveringToolbar } from './hovering-toolbar'
import { renderLeaf, toggleFormat } from './elements/format'
import { withNodeId } from './node-id/with-node-id'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { CustomElement } from './custom-element'
import { withLogo } from './logo/with-logo'
import { InlineLogoPicker } from './logo/inline-logo-picker'
import { useLogoPicker } from './logo/use-logo-picker'
import { withShortcuts } from './shortcuts/with-shortcuts'
import { withBanner } from './banner/with-banner'
import { useDispatch } from 'react-redux'
import { setSaved, setSaving } from './editor.reducer'
import { useDebounceEffect } from '~/hooks/use-debounce-effect'
import { useMutation } from '@apollo/client'
import { SavePageDocument } from '~/graphql/document.generated'
import { BlockPicker } from './blocks/block-picker'
import { useBlocks } from './blocks/use-blocks'
import OpenColor from 'open-color'
import { withSkillList } from './skill-list/with-skill-list'
import { useStyletron } from 'baseui'
import { StyleObject } from 'styletron-standard'
import { border, padding, transitions } from 'polished'
import classNames from 'classnames'
import { withEditor } from './with-editor'
import { withProjectList } from './project-list/with-project-list'

const PLUGINS = [
	withEditor,
	withHistory,
	withReact,
	withBanner,
	withSkillList,
	withProjectList,
	withLogo,
	withShortcuts,
	withNodeId,
]

interface PageEditorProps {
	initialContent: Descendant[]
	className?: string
}

export const PageEditor = ({ className, initialContent }: PageEditorProps) => {
	const [css] = useStyletron()
	const dispatch = useDispatch()

	// https://github.com/ianstormtaylor/slate/issues/4081#issuecomment-782136472
	const editorRef = useRef<Editor>()
	if (!editorRef.current)
		editorRef.current = PLUGINS.reduce(
			(editor, plugin) => plugin(editor),
			createEditor()
		)
	const editor = editorRef.current

	const [content, setContent] = useState<Descendant[]>(initialContent)

	const { handleIconPicker } = useLogoPicker(editor)
	const { onAddBlockButtonClick } = useBlocks(editor)

	const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
		(event) => {
			if (handleIconPicker(event)) {
				event.preventDefault()
			}
			if (event.key === 'Tab') {
				event.preventDefault()
				Transforms.move(editor, { distance: 1, unit: 'line' })
			}
		},
		[editor, handleIconPicker]
	)

	const onChange = useCallback((newContent: Descendant[]) => {
		setContent(newContent)
	}, [])

	const [savePage] = useMutation(SavePageDocument, {
		onCompleted: () => {
			dispatch(setSaving(false))
			dispatch(setSaved(true))
		},
	})

	useEffect(() => {
		dispatch(setSaved(false))
	}, [dispatch, content])

	useDebounceEffect(
		() => {
			dispatch(setSaving(true))
			savePage({
				variables: {
					content,
				},
			})
		},
		1000,
		[content]
	)

	return (
		<div
			className={classNames(
				className,
				css({
					display: 'flex',
					flexDirection: 'column',
					paddingBottom: '30vh',
				})
			)}
		>
			<DndProvider backend={HTML5Backend}>
				<Slate editor={editor} value={content} onChange={onChange}>
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
						className={css({
							paddingLeft: '32px',
							paddingRight: '32px',
							paddingBottom: '96px',
						})}
						onKeyDown={onKeyDown}
						autoCapitalize="false"
						autoCorrect="false"
						// https://github.com/ianstormtaylor/slate/pull/4299
						// ?????? drop event ??? skip ??????.
						// TODO: ?????? DnD ????????? true ???????????????
						onDrop={() => true}
					/>
					<HoveringToolbar />
					<InlineLogoPicker />
					<BlockPicker />
				</Slate>
			</DndProvider>
			<button
				className={css(addBlockButton)}
				onMouseDown={onAddBlockButtonClick}
			>
				Add a Block
			</button>
		</div>
	)
}

const addBlockButton: StyleObject = {
	marginLeft: '32px',
	marginRight: '32px',
	...padding('32px'),
	background: 'none',
	cursor: 'pointer',
	borderRadius: '8px',
	color: OpenColor.gray[4],
	...border('1px', 'dotted', OpenColor.gray[4]),
	...transitions(['color', 'border-color'], '0.2s'),
	':hover': {
		borderColor: OpenColor.gray[6],
		color: OpenColor.gray[6],
	},
}
