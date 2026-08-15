import type { DeliveryMethodVm } from "../services/CartService";

export const formatDeliveryAddress = (
    address: string,
    selectedDelivery: DeliveryMethodVm | undefined,
    novaPoshtaType: "branch" | "postomat"
): string => {
    let finalAddress = address.trim();
    if (!finalAddress || !selectedDelivery) return finalAddress;

    const lowerAddress = finalAddress.toLowerCase();

    // NovaPoshta (Type 2)
    if (selectedDelivery.type === 2) {
        const prefix = novaPoshtaType === "postomat" ? "Поштомат №" : "Відділення №";
        if (!lowerAddress.includes("пошт") && !lowerAddress.includes("відділ")) {
            finalAddress = `${prefix}${finalAddress}`;
        }
    } 
    // Ukrposhta (Type 5)
    else if (selectedDelivery.type === 5) {
        if (!lowerAddress.includes("відділ") && !lowerAddress.includes("індекс")) {
            finalAddress = `Відділення/Індекс: ${finalAddress}`;
        }
    }

    return finalAddress;
};
