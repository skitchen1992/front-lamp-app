import type {
	CategoryResponse,
	ProductLifecycleStatus
} from '@/entities/product/products'
import type {
	CreateProductRequest,
	UpdateProductRequest
} from '@/shared/api/productManagementApi'
import type {AdminCategory} from '../_lib/data'

export const productFormId = 'admin-product-editor-form'

export type ProductCategoryOption = Pick<AdminCategory, 'id' | 'name'>

interface CreateProductRequestResult {
	request: CreateProductRequest
}

interface UpdateProductRequestResult {
	request: UpdateProductRequest
}

interface ProductFormErrorResult {
	error: string
}

export function getActiveApiCategories(
	categories: CategoryResponse[]
): ProductCategoryOption[] {
	return categories
		.filter(category => category.isActive)
		.toSorted(
			(left, right) =>
				left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
		)
		.map(category => ({
			id: category.id,
			name: category.name
		}))
}

export function getSubmitButtonText(isNewProduct: boolean, isLoading: boolean) {
	if (!isNewProduct) {
		return isLoading ? 'Сохраняем...' : 'Сохранить изменения'
	}

	return isLoading ? 'Создаем товар...' : 'Создать товар'
}

export function getCreateProductRequest(
	form: HTMLFormElement
): CreateProductRequestResult | ProductFormErrorResult {
	return getProductFormRequest(form)
}

export function getUpdateProductRequest(
	form: HTMLFormElement
): UpdateProductRequestResult | ProductFormErrorResult {
	return getProductFormRequest(form)
}

function getProductFormRequest(
	form: HTMLFormElement
): CreateProductRequestResult | ProductFormErrorResult {
	const formData = new FormData(form)
	const categoryId = getRequiredText(formData, 'categoryId')
	const name = getRequiredText(formData, 'name')
	const sku = getRequiredText(formData, 'sku')
	const slug = getOptionalText(formData, 'slug') ?? makeProductSlug(name, sku)
	const price = getRequiredNumber(formData, 'price')
	const stockQty = getRequiredInteger(formData, 'stockQty')

	if (!categoryId) {
		return {error: 'Выберите категорию товара.'}
	}
	if (!name) {
		return {error: 'Укажите наименование товара.'}
	}
	if (!sku) {
		return {error: 'Укажите артикул товара.'}
	}
	if (price === undefined || price < 0) {
		return {error: 'Укажите корректную цену товара.'}
	}
	if (stockQty === undefined || stockQty < 0) {
		return {error: 'Укажите корректный остаток товара.'}
	}

	const status = getProductLifecycleStatus(formData)
	const shortDescription = getOptionalText(formData, 'shortDescription')
	const fullDescription = getOptionalText(formData, 'fullDescription')

	return {
		request: {
			categoryId,
			currency: 'RUB',
			fullDescription,
			isFeatured: formData.get('isFeatured') === 'on',
			name,
			price: price.toFixed(2),
			shortDescription,
			sku,
			slug,
			status,
			stockQty
		}
	}
}

export function getCreateProductErrorMessage(error: unknown) {
	if (isFetchBaseQueryError(error)) {
		if (error.status === 401) {
			return 'Сессия администратора истекла. Войдите в админку заново.'
		}
		if (error.status === 404) {
			return 'Выбранная категория не найдена на сервере.'
		}
		if (error.status === 409) {
			return 'Товар с таким артикулом или slug уже существует.'
		}
		if (error.status === 422) {
			return 'Проверьте поля товара: сервер не принял часть данных.'
		}
	}

	return 'Не удалось создать товар. Попробуйте еще раз.'
}

export function getUpdateProductErrorMessage(error: unknown) {
	if (isFetchBaseQueryError(error)) {
		if (error.status === 401) {
			return 'Сессия администратора истекла. Войдите в админку заново.'
		}
		if (error.status === 404) {
			return 'Товар или выбранная категория не найдены на сервере.'
		}
		if (error.status === 409) {
			return 'Товар с таким артикулом или slug уже существует.'
		}
		if (error.status === 422) {
			return 'Проверьте поля товара: сервер не принял часть данных.'
		}
	}

	return 'Не удалось сохранить товар. Попробуйте еще раз.'
}

export function getDeleteProductErrorMessage(error: unknown) {
	if (isFetchBaseQueryError(error)) {
		if (error.status === 401) {
			return 'Сессия администратора истекла. Войдите в админку заново.'
		}
		if (error.status === 404) {
			return 'Товар не найден на сервере.'
		}
		if (error.status === 422) {
			return 'Сервер не принял запрос на удаление товара.'
		}
	}

	return 'Не удалось удалить товар. Попробуйте еще раз.'
}

function getRequiredText(formData: FormData, name: string) {
	const value = formData.get(name)

	return typeof value === 'string' ? value.trim() : ''
}

function getOptionalText(formData: FormData, name: string) {
	const text = getRequiredText(formData, name)

	return text ? text : null
}

function getRequiredNumber(formData: FormData, name: string) {
	const rawValue = getRequiredText(formData, name).replace(',', '.')
	const value = Number(rawValue)

	return Number.isFinite(value) ? value : undefined
}

function getRequiredInteger(formData: FormData, name: string) {
	const value = getRequiredNumber(formData, name)

	return value !== undefined && Number.isInteger(value) ? value : undefined
}

function getProductLifecycleStatus(formData: FormData): ProductLifecycleStatus {
	const status = formData.get('status')

	return status === 'active' || status === 'archived' || status === 'draft'
		? status
		: 'draft'
}

function makeProductSlug(name: string, sku: string) {
	const source = sku || name
	const slug = source
		.toLowerCase()
		.replace(/[а-яё]/giu, letter => cyrillicSlugMap.get(letter) ?? letter)
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-+|-+$/gu, '')

	return slug || 'product'
}

const cyrillicSlugMap = new Map([
	['а', 'a'],
	['б', 'b'],
	['в', 'v'],
	['г', 'g'],
	['д', 'd'],
	['е', 'e'],
	['ё', 'e'],
	['ж', 'zh'],
	['з', 'z'],
	['и', 'i'],
	['й', 'y'],
	['к', 'k'],
	['л', 'l'],
	['м', 'm'],
	['н', 'n'],
	['о', 'o'],
	['п', 'p'],
	['р', 'r'],
	['с', 's'],
	['т', 't'],
	['у', 'u'],
	['ф', 'f'],
	['х', 'h'],
	['ц', 'ts'],
	['ч', 'ch'],
	['ш', 'sh'],
	['щ', 'sch'],
	['ъ', ''],
	['ы', 'y'],
	['ь', ''],
	['э', 'e'],
	['ю', 'yu'],
	['я', 'ya']
])

function isFetchBaseQueryError(
	error: unknown
): error is {status: number | string} {
	return typeof error === 'object' && error !== null && 'status' in error
}
