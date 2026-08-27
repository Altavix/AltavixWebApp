export interface BrandDto {
    id: string;
    name: string;
    enabled: boolean;
}

export interface BrandsListVm {
    brands: BrandDto[];
}
