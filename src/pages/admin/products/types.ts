import type {ProductLifecycleStatus} from '@/entities/product/products'

export const allCategoriesValue = 'all'
export const allStatusesValue = 'all'

export type ProductStatusFilter =
	| ProductLifecycleStatus
	| typeof allStatusesValue

export const productStatusOptions: Array<{
	label: string
	value: ProductStatusFilter
}> = [
	{label: 'Все статусы', value: allStatusesValue},
	{label: 'Активные', value: 'active'},
	{label: 'Черновики', value: 'draft'},
	{label: 'Архив', value: 'archived'}
]
