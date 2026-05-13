import {useCallback, useState} from 'react'
import {cn} from '@/shared/lib/utils'
import {type Inquiry, inquiries, inquiryStatusMeta} from './data'
import {StatusBadge} from './shared'

export function AdminInquiries() {
	const [selectedInquiryId, setSelectedInquiryId] = useState(inquiries[0].id)
	const selectedInquiry =
		inquiries.find(inquiry => inquiry.id === selectedInquiryId) ?? inquiries[0]

	return (
		<section className='grid min-h-screen bg-slate-100 xl:grid-cols-[minmax(0,1fr)_40rem]'>
			<div className='px-4 py-7 sm:px-6 lg:px-7'>
				<h1 className='font-bold text-3xl tracking-normal'>
					Обращения (3 новых)
				</h1>
				<div className='mt-5 space-y-4'>
					{inquiries.map(inquiry => (
						<InquiryListItem
							inquiry={inquiry}
							isSelected={inquiry.id === selectedInquiry.id}
							key={inquiry.id}
							onSelect={setSelectedInquiryId}
						/>
					))}
				</div>
			</div>
			<InquiryDetails inquiry={selectedInquiry} />
		</section>
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
				isSelected && 'border-red-500'
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
		<aside className='border-slate-200 border-l bg-background px-4 py-8 sm:px-6 lg:px-8'>
			<div className='flex items-start justify-between gap-4'>
				<h2 className='font-bold text-2xl'>{inquiry.subject}</h2>
				<StatusBadge {...inquiryStatusMeta[inquiry.status]} />
			</div>

			<section className='mt-6 rounded-lg bg-slate-50 p-5'>
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
			</section>

			<section className='mt-6 rounded-lg border p-5'>
				<p className='font-semibold text-slate-400 text-sm'>Текст обращения</p>
				<p className='mt-3 italic leading-7'>{inquiry.message}</p>
			</section>

			<section className='mt-6 rounded-lg border bg-slate-50 p-5'>
				<h3 className='font-semibold'>Изменить статус</h3>
				<div className='mt-4 flex flex-wrap gap-2'>
					{(['new', 'processing', 'answered', 'closed', 'spam'] as const).map(
						status => (
							<button
								className={cn(
									'h-9 rounded-md border bg-background px-3 font-medium text-slate-500 text-sm transition hover:bg-slate-100',
									status === inquiry.status && 'border-red-500 text-red-500'
								)}
								key={status}
								type='button'
							>
								{inquiryStatusMeta[status].label}
							</button>
						)
					)}
				</div>
			</section>
		</aside>
	)
}
