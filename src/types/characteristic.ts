export interface CharacteristicDto {
    id: string;
    name: string;
    enabled: boolean;
}

export interface CharacteristicsListVm {
    characteristics: CharacteristicDto[];
}
