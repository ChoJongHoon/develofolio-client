import { FC, useEffect, useRef, useState } from 'react'
import { Icon } from '../../../components/icon'
import { useDndBlock } from './hooks/use-dnd-block'
import OpenColor from 'open-color'
import { useHover } from '~/hooks/use-hover'
import mergeRefs from 'react-merge-refs'
import { useStyletron } from 'styletron-react'
import { padding, transitions } from 'polished'

type DraggableProps = {
	id: string
}

export const Draggable: FC<DraggableProps> = ({ children, id }) => {
	const [css] = useStyletron()
	const rootRef = useRef<HTMLDivElement>(null)
	const [hoverRef, isHovered] = useHover()
	const [height, setHeight] = useState(0)

	const { dropLine, dragRef, isDragging } = useDndBlock({
		id: id as string,
		blockRef: rootRef,
	})

	useEffect(() => {
		const child = rootRef.current?.querySelector('[data-slate-node="element"]')
		if (!child) return

		const { height } = child.getBoundingClientRect()
		console.log(`height`, height)
		setHeight(height)
	}, [])

	return (
		<div
			className={css({
				position: 'relative',
				opacity: isDragging ? 0.5 : 1,
			})}
			ref={mergeRefs([rootRef, hoverRef])}
		>
			<div
				className={css({
					...padding('4px', '0px'),
				})}
			>
				{children}
				{dropLine && (
					<div
						className={css({
							position: 'absolute',
							left: '0',
							right: '0',
							top: dropLine === 'top' ? '-2px' : undefined,
							bottom: dropLine === 'bottom' ? '-2px' : undefined,
							height: '4px',
							background: OpenColor.blue[2],
						})}
						contentEditable={false}
					/>
				)}
			</div>
			<div
				className={css({
					boxSizing: 'border-box',
					...padding('0px'),
					position: 'absolute',
					bottom: '4px',
					transform: 'translateX(-100%)',
					display: 'flex',
					height: `${height}px`,
				})}
				contentEditable={false}
			>
				<button
					ref={dragRef}
					className={css({
						cursor: 'grab',
						border: 'none',
						background: 'none',
						...padding('0px'),
						display: 'inline-flex',
						outlineStyle: 'none',
						opacity: isHovered ? 1 : 0,
						...transitions(['opacity'], '0.2s'),
						marginRight: '4px',
						pointerEvents: 'auto',
						alignItems: 'center',
						borderRadius: '4px',
						':hover': {
							backgroundColor: OpenColor.gray[1],
						},
					})}
					onMouseDown={(event) => event.stopPropagation()}
				>
					<Icon type="DragHandle" size={20} color={OpenColor.gray[5]} />
				</button>
			</div>
		</div>
	)
}
