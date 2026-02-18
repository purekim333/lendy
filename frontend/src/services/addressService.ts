import { fetchWithAccess } from "../util/fetchUtil";

const API_BASE = "/api/v1/addresses";

export interface Address {
  id?: number;
  label: string;
  receiverName: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

export async function getAddresses(): Promise<Address[]> {
  const res = await fetchWithAccess(API_BASE);
  if (!res.ok) throw new Error("배송지 조회 실패");
  return res.json();
}

export async function createAddress(address: Address): Promise<Address> {
  const res = await fetchWithAccess(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });
  if (!res.ok) throw new Error("배송지 추가 실패");
  return res.json();
}

export async function updateAddress(id: number, address: Address): Promise<Address> {
  const res = await fetchWithAccess(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });
  if (!res.ok) throw new Error("배송지 수정 실패");
  return res.json();
}

export async function deleteAddress(id: number): Promise<void> {
  const res = await fetchWithAccess(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("배송지 삭제 실패");
}
