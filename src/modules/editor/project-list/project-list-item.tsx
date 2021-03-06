import React, { useCallback, useState } from 'react'
import { useStyletron } from 'styletron-react'
import {
	CustomRenderElementProps,
	LogoElement,
	ProjectListItemElement,
} from '../custom-types'
import Image from 'next/image'
import OpenColor from 'open-color'
import { padding, transitions } from 'polished'
import { Icon, IconType } from '~/components/icon'
import { useHover } from '~/hooks/use-hover'
import { StatefulPopover } from 'baseui/popover'
import { PopoverLogoPicker } from '../logo/popover-logo-picker'
import { ILogo } from '../logo/types'
import { ReactEditor, useSlateStatic } from 'slate-react'
import { Transforms } from 'slate'
import { useFileLoad } from '~/hooks/use-file-load'
import { useApolloClient } from '@apollo/client'
import axios from 'axios'
import { useUser } from '~/modules/user/hooks/use-user'
import { generateImagePath } from '~/utils/generate-image-path'
import { EditLinkPopover } from '../social-link/edit-link-popover'
import {
	GenerateUploadUrlDocument,
	UploadType,
} from '~/graphql/document.generated'
import { ImageUploader } from '~/components/image-uploader'

export const EMPTY_PROJECT_LIST_ITEM: ProjectListItemElement = {
	type: 'project-list-item',
	logos: [],
	links: { appstore: null, github: null, playstore: null, web: null },
	thumbnail: null,
	children: [
		{ type: 'project-list-item-name', children: [{ text: '' }] },
		{ type: 'project-list-item-description', children: [{ text: '' }] },
	],
}

const LINKS: Array<{
	name: keyof ProjectListItemElement['links']
	label: string
	icon: IconType
}> = [
	{ name: 'web', label: '웹사이트', icon: 'Web' },
	{ name: 'playstore', label: '플레이스토어', icon: 'Playstore' },
	{ name: 'appstore', label: '앱스토어', icon: 'Appstore' },
	{ name: 'github', label: '깃허브', icon: 'Github' },
]

export const ProjectListItem = ({
	attributes,
	children,
	element,
}: CustomRenderElementProps<ProjectListItemElement>) => {
	const [css] = useStyletron()
	const client = useApolloClient()
	const editor = useSlateStatic()

	const onLogoRemove = useCallback(
		(index: number) => {
			const path = ReactEditor.findPath(editor, element)
			const newProperties: Partial<ProjectListItemElement> = {
				logos: element.logos.filter((_, i) => i !== index),
			}
			Transforms.setNodes(editor, newProperties, { at: path })
		},
		[editor, element]
	)

	const onLogoAdd = useCallback(
		(logo: ILogo) => {
			const path = ReactEditor.findPath(editor, element)
			const newProperties: Partial<ProjectListItemElement> = {
				logos: [
					...element.logos,
					{
						name: logo.name,
						url: logo.url,
						shortname: logo.shortname,
						file: logo.files[0],
					},
				],
			}
			Transforms.setNodes(editor, newProperties, { at: path })
		},
		[editor, element]
	)

	const [progress, setProgress] = useState(0)
	const onAddThumbnail = useCallback(
		async (file: File) => {
			const {
				data: {
					generateUploadPath: { key, url },
				},
			} = await client.query({
				query: GenerateUploadUrlDocument,
				variables: {
					type: UploadType.Project,
					filename: file.name,
				},
			})

			await axios.put(url, file, {
				headers: {
					'Content-Type': file.type,
				},
				onUploadProgress: ({ loaded, total }: ProgressEvent) => {
					setProgress((loaded / total) * 100)
				},
			})

			const path = ReactEditor.findPath(editor, element)
			const newProperties: Partial<ProjectListItemElement> = {
				thumbnail: key,
			}
			Transforms.setNodes(editor, newProperties, { at: path })
		},
		[client, editor, element]
	)
	const onRemoveThumbnail = useCallback(() => {
		const path = ReactEditor.findPath(editor, element)
		Transforms.setNodes<ProjectListItemElement>(
			editor,
			{ thumbnail: null },
			{ at: path }
		)
	}, [editor, element])

	return (
		<div
			{...attributes}
			className={css({
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: OpenColor.gray[0],
				borderRadius: '8px',
			})}
		>
			<div
				contentEditable={false}
				className={css({
					width: '100%',
					backgroundColor: OpenColor.gray[1],
					overflow: 'hidden',
					borderTopLeftRadius: '8px',
					borderTopRightRadius: '8px',
					position: 'relative',
					userSelect: 'none',
					':before': {
						content: '" "',
						display: 'block',
						paddingTop: `${(9 / 16) * 100}%`,
					},
				})}
			>
				<ImageUploader
					onDrop={onAddThumbnail}
					onDelete={onRemoveThumbnail}
					image={element.thumbnail}
					className={css({
						position: 'absolute',
						top: '0px',
						left: '0px',
						borderTopLeftRadius: '8px',
						borderTopRightRadius: '8px',
					})}
					progressAmount={progress}
				/>
			</div>
			<div
				className={css({
					...padding('16px'),
				})}
			>
				{children[0]}
				<div
					contentEditable={false}
					className={css({
						marginBottom: '8px',
						display: 'flex',
						gap: '8px',
						userSelect: 'none',
					})}
				>
					{element.logos.map((logo, index) => (
						<Logo
							key={`${logo.name}-${index}`}
							logo={logo}
							onClick={() => {
								onLogoRemove(index)
							}}
						/>
					))}
					<StatefulPopover
						content={({ close }) => (
							<PopoverLogoPicker onLogoAdd={onLogoAdd} onClose={close} />
						)}
						placement="bottomLeft"
						focusLock
						autoFocus
					>
						<button
							className={css({
								width: '16px',
								height: '16px',
								display: 'inline-flex',
								justifyContent: 'center',
								alignItems: 'center',
								border: 'none',
								background: 'none',
								cursor: 'pointer',
								...padding('0px'),
								borderRadius: '4px',
								...transitions(['background-color', 'opacity'], '0.2s'),
								':hover': {
									backgroundColor: OpenColor.gray[2],
								},
							})}
						>
							<Icon type="Plus" size={12} color={OpenColor.gray[5]} />
						</button>
					</StatefulPopover>
				</div>
				{children.slice(1)}
				<div
					contentEditable={false}
					className={css({
						userSelect: 'none',
						display: 'flex',
						justifyContent: 'flex-end',
						marginTop: '8px',
					})}
				>
					{LINKS.map((link) => (
						<StatefulPopover
							key={link.name}
							content={({ close }) => (
								<EditLinkPopover
									defaultValue={element.links[link.name]}
									onClose={close}
									onChange={(value) => {
										const path = ReactEditor.findPath(editor, element)
										const newProperties: Partial<ProjectListItemElement> = {
											links: {
												...element.links,
												[link.name]: value,
											},
										}
										Transforms.setNodes(editor, newProperties, { at: path })
									}}
								/>
							)}
							placement="bottomLeft"
							focusLock
						>
							<button
								className={css({
									backgroundColor: OpenColor.white,
									border: 'none',
									width: '28px',
									height: '28px',
									borderRadius: '50%',
									cursor: 'pointer',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									opacity: element.links[link.name] ? 1 : 0.5,
									...padding('0px'),
									...transitions(['opacity'], '0.2s'),
									':hover': {
										opacity: element.links[link.name] ? 1 : 0.8,
									},
									':not(:last-child)': {
										marginRight: '8px',
									},
								})}
							>
								<Icon type={link.icon} color={OpenColor.teal[7]} size={20} />
							</button>
						</StatefulPopover>
					))}
				</div>
			</div>
		</div>
	)
}

interface LogoProps {
	logo: Omit<LogoElement, 'type' | 'children'>
	onClick: React.MouseEventHandler<HTMLButtonElement>
}

const Logo = ({ logo, onClick }: LogoProps) => {
	const [css] = useStyletron()
	const [hoverRef, isHovered] = useHover<HTMLButtonElement>()

	return (
		<button
			key={logo.file}
			className={css({
				position: 'relative',
				border: 'none',
				background: 'none',
				cursor: 'pointer',
				padding: '0px',
				display: 'inline-flex',
			})}
			onClick={onClick}
			ref={hoverRef}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={`/logos/${logo.file}`}
				className={css({
					height: '16px',
					display: 'block',
				})}
				alt={logo.name}
			/>
			<div
				className={css({
					position: 'absolute',
					top: '0px',
					left: '0px',
					bottom: '0px',
					right: '0px',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					borderRadius: '4px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					opacity: isHovered ? 1 : 0,
					...transitions(['opacity'], '0.2s'),
				})}
			>
				<Icon type="TrashLine" size={14} color={OpenColor.red[7]} />
			</div>
		</button>
	)
}
