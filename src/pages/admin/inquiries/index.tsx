import {useCallback, useState} from 'react'
import {cn} from '@/shared/lib/utils'
import {AdminSplitShell} from '../_components/layout'
import {AdminPanel, StatusBadge} from '../_components/shared'
import {type Inquiry, inquiries, inquiryStatusMeta} from '../_lib/data'

export function AdminInquiries() {
	const [selectedInquiryId, setSelectedInquiryId] = useState(inquiries[0].id)
	const selectedInquiry =
		inquiries.find(inquiry => inquiry.id === selectedInquiryId) ?? inquiries[0]

	return (
		<AdminSplitShell
			details={<InquiryDetails inquiry={selectedInquiry} />}
			detailsSize='wide'
			title='Обращения (3 новых)'
		>
			<div className='space-y-4'>
				{inquiries.map(inquiry => (
					<InquiryListItem
						inquiry={inquiry}
						isSelected={inquiry.id === selectedInquiry.id}
						key={inquiry.id}
						onSelect={setSelectedInquiryId}
					/>
				))}
			</div>
		</AdminSplitShell>
	)
}

interface InquiryListItemProperties {
	inquiry: Inquiry
	isSelected: boolean
	onSelect: (inquiryId: string) => void
}

function InquiryListItem({
	inquiry,
	isSelected,
	onSelect
}: InquiryListItemProperties) {
	const handleSelect = useCallback(() => {
		onSelect(inquiry.id)
	}, [inquiry.id, onSelect])

	return (
		<button
			className={cn(
				'w-full rounded-lg border bg-background p-4 text-left shadow-xs transition hover:border-blue-300',
				isSelected && 'border-blue-600 bg-blue-50'
			)}
			onClick={handleSelect}
			type='button'
		>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<p className='font-semibold'>{inquiry.subject}</p>
					<p className='mt-2 text-slate-500 text-sm italic'>
						{inquiry.name} · {inquiry.email}
					</p>
				</div>
				<StatusBadge {...inquiryStatusMeta[inquiry.status]} />
			</div>
			<p className='mt-3 line-clamp-1 text-slate-500 text-sm italic'>
				{inquiry.message}
			</p>
			<p className='mt-3 text-slate-400 text-xs italic'>{inquiry.createdAt}</p>
		</button>
	)
}

function InquiryDetails({inquiry}: {inquiry: Inquiry}) {
	return (
		<>
			<div className='flex items-start justify-between gap-4'>
				<h2 className='font-bold text-2xl'>{inquiry.subject}</h2>
				<StatusBadge {...inquiryStatusMeta[inquiry.status]} />
			</div>

			<AdminPanel className='mt-6 bg-slate-50 p-5 shadow-none'>
				<p className='font-semibold text-slate-400 text-sm'>Отправитель</p>
				<p className='mt-2 font-semibold'>{inquiry.name}</p>
				<p className='mt-2 text-slate-500 text-sm'>
					{inquiry.phone}
					<span className='mx-3 text-slate-300'>·</span>
					<a
						className='text-blue-600 hover:underline'
						href={`mailto:${inquiry.email}`}
					>
						{inquiry.email}
					</a>
				</p>
				<p className='mt-2 text-slate-400 text-sm italic'>
					{inquiry.createdAt}
				</p>
			</AdminPanel>

			<AdminPanel className='mt-6 p-5'>
				<p className='font-semibold text-slate-400 text-sm'>Текст обращения</p>
				<p className='mt-3 italic leading-7'>{inquiry.message}</p>
			</AdminPanel>

			<AdminPanel className='mt-6 bg-slate-50 p-5'>
				<h3 className='font-semibold'>Изменить статус</h3>
				<div className='mt-4 flex flex-wrap gap-2'>
					{(['new', 'processing', 'answered', 'closed', 'spam'] as const).map(
						status => (
							<button
								className={cn(
									'h-9 rounded-md border bg-background px-3 font-medium text-slate-500 text-sm transition hover:bg-slate-100',
									status === inquiry.status && 'border-blue-600 text-blue-600'
								)}
								key={status}
								type='button'
							>
								{inquiryStatusMeta[status].label}
							</button>
						)
					)}
				</div>
			</AdminPanel>
		</>
	)
}
