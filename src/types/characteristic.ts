export interface CharacteristicDto {
    id: string;
    name: string;
    enabled: boolean;
}

export interface CharacteristicsListVm {
    characteristics: CharacteristicDto[];
}

export interface CharacteristicFilterDto {
    id: string;
    name: string;
    values: string[];
}
