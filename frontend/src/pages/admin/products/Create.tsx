import React, { useMemo, useRef, useState } from "react";

/**
 * Admin > 상품 등록 (쇼핑몰/구매형)
 * - 대여 관련 필드 전부 제거
 * - 가격: 판매가(price) + 비교가(compareAtPrice) + (옵션별) 개별가
 * - 옵션 → 변형(variants) 자동 생성: 색상/사이즈 조합, SKU/바코드/재고/개별가 입력
 * - 이미지 업로드(드래그&드롭/순서 변경/삭제)
 * - 상세/노출/배송/SEO
 * - 제출: multipart/form-data (meta JSON + images[])
 */

// ---------- 타입 ----------
export type Variant = {
  id: string;        // 고유키: `${color}-${size}` 등
  color: string;
  size: string;
  sku: string;
  barcode?: string;
  stock: number;
  priceOverride?: number | null; // 없으면 공통 price 사용
};

export type ProductPayload = {
  title: string;
  brand?: string;
  category: string;
  tags: string[];
  price: number; // 공통 판매가
  compareAtPrice?: number | null; // 비교가/정가
  saleStart?: string | null; // ISO
  saleEnd?: string | null;   // ISO
  description: string;
  details: {
    thickness?: "very_thick" | "thick" | "normal" | "thin" | "very_thin";
    elasticity?: "very_high" | "high" | "normal" | "low" | "none";
    transparency?: "very_high" | "high" | "normal" | "low" | "none";
    lining?: "full" | "partial" | "none";
  };
  colors: string[];
  sizes: string[];
  variants: Variant[];
  status: "draft" | "published";
  visibleFrom?: string | null;
  shipping?: {
    templateId?: string;
    weightGrams?: number | null;
    widthMm?: number | null;
    heightMm?: number | null;
    depthMm?: number | null;
  };
  seoTitle?: string;
  seoDescription?: string;
};

// ---------- 유틸 ----------
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const toNum = (v: string, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);

// ---------- 메인 ----------
export default function AdminProductCreate() {
  // 기본
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // 가격
  const [price, setPrice] = useState<number | "">("");
  const [compareAtPrice, setCompareAtPrice] = useState<number | "" | null>("");
  const [saleStart, setSaleStart] = useState("");
  const [saleEnd, setSaleEnd] = useState("");

  // 옵션/변형
  const [colorsInput, setColorsInput] = useState(""); // 예: White, Black
  const [sizesInput, setSizesInput] = useState("");   // 예: S, M, L
  const [variants, setVariants] = useState<Variant[]>([]);

  // 상세
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<ProductPayload["details"]>({});

  // 배송/치수
  const [shippingTemplateId, setShippingTemplateId] = useState("");
  const [weightGrams, setWeightGrams] = useState<number | "">("");
  const [widthMm, setWidthMm] = useState<number | "">("");
  const [heightMm, setHeightMm] = useState<number | "">("");
  const [depthMm, setDepthMm] = useState<number | "">("");

  // 노출/SEO
  const [status, setStatus] = useState<ProductPayload["status"]>("draft");
  const [visibleFrom, setVisibleFrom] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // 이미지
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // 파생
  const tags = useMemo(() => tagsInput.split(",").map(t => t.trim()).filter(Boolean), [tagsInput]);
  const colors = useMemo(() => colorsInput.split(",").map(t => t.trim()).filter(Boolean), [colorsInput]);
  const sizes = useMemo(() => sizesInput.split(",").map(t => t.trim()).filter(Boolean), [sizesInput]);

  // 변형 생성
  const buildVariants = () => {
    const next: Variant[] = [];
    for (const c of colors) {
      for (const s of sizes) {
        const id = `${c}-${s}`;
        const exist = variants.find(v => v.id === id);
        next.push(
          exist ?? {
            id,
            color: c,
            size: s,
            sku: `${(brand || "LND").slice(0,3).toUpperCase()}-${uid()}`,
            barcode: "",
            stock: 0,
            priceOverride: null,
          }
        );
      }
    }
    setVariants(next);
  };

  // 이미지 업로더
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setImages(prev => [...prev, ...arr]);
    arr.forEach(f => setPreviews(prev => [...prev, URL.createObjectURL(f)]));
  };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const moveImage = (i: number, dir: -1|1) => {
    const ni = i + dir; if (ni < 0 || ni >= previews.length) return;
    setImages(prev => { const n=[...prev]; [n[i],n[ni]]=[n[ni],n[i]]; return n; });
    setPreviews(prev => { const n=[...prev]; [n[i],n[ni]]=[n[ni],n[i]]; return n; });
  };
  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_,idx)=>idx!==i));
    setPreviews(prev => prev.filter((_,idx)=>idx!==i));
  };

  // 검증
  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("상품명을 입력하세요.");
    if (!category.trim()) errs.push("카테고리를 입력하세요.");
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) errs.push("판매가를 0보다 크게 입력하세요.");
    if (!colors.length || !sizes.length) errs.push("색상/사이즈 입력 후 ‘변형 생성’을 눌러주세요.");
    if (!variants.length) errs.push("변형(variants)이 없습니다.");
    if (!images.length) errs.push("이미지를 최소 1장 업로드하세요.");
    return errs;
  };

  // 제출
  const onSubmit = async () => {
    const errs = validate();
    if (errs.length) { alert("입력 오류\n- " + errs.join("\n- ")); return; }

    const payload: ProductPayload = {
      title,
      brand: brand || undefined,
      category,
      tags,
      price: Number(price),
      compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice),
      saleStart: saleStart || null,
      saleEnd: saleEnd || null,
      description,
      details,
      colors,
      sizes,
      variants,
      status,
      visibleFrom: visibleFrom || null,
      shipping: {
        templateId: shippingTemplateId || undefined,
        weightGrams: weightGrams === "" ? null : Number(weightGrams),
        widthMm: widthMm === "" ? null : Number(widthMm),
        heightMm: heightMm === "" ? null : Number(heightMm),
        depthMm: depthMm === "" ? null : Number(depthMm),
      },
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    const form = new FormData();
    form.append("meta", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    images.forEach((f, i) => form.append("images", f, f.name || `image-${i}.jpg`));

    try {
      const res = await fetch("/api/admin/products", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      alert("상품이 등록되었습니다.");
    } catch (e: any) {
      alert("등록 실패: " + (e?.message || "알 수 없는 오류"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {/* 헤더 */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">상품 등록</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setStatus("draft")} className={`px-3 py-2 rounded-xl border ${status === "draft" ? "bg-gray-100" : "bg-white"}`}>임시저장</button>
          <button onClick={() => setStatus("published")} className={`px-3 py-2 rounded-xl border ${status === "published" ? "bg-emerald-50 border-emerald-300" : "bg-white"}`}>게시 예정</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90">저장하기</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2열 */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="상품명" value={title} onChange={setTitle} placeholder="예) 레트로 그래픽 반팔 티셔츠 (Black)" required />
              <TextField label="브랜드" value={brand} onChange={setBrand} placeholder="예) SYND" />
              <TextField label="타입" value={category} onChange={setCategory} placeholder="예) Top" required />
              <TextField label="태그" value={tagsInput} onChange={setTagsInput} placeholder="예) summer" />
            </div>
          </Section>

          <Section title="이미지">
            <div ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} className="border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-50">
              <p className="mb-3">이미지를 드래그 앤 드롭하거나 파일을 선택하세요.</p>
              <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
            </div>
            {!!previews.length && (
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <li key={src} className="relative group">
                    <img src={src} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                    <div className="absolute inset-x-1 -bottom-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="px-2 py-1 text-xs rounded-lg bg-white border" onClick={() => moveImage(i, -1)}>↑</button>
                      <button className="px-2 py-1 text-xs rounded-lg bg-white border" onClick={() => moveImage(i, 1)}>↓</button>
                      <button className="px-2 py-1 text-xs rounded-lg bg-white border" onClick={() => removeImage(i)}>삭제</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500 mt-2">첫 번째 이미지가 대표 썸네일로 사용됩니다.</p>
          </Section>

          <Section title="가격">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberField label="판매가" value={price} onChange={v => setPrice(v === "" ? "" : toNum(v))} min={0} required />
              <NumberField label="비교가(정가)" value={compareAtPrice ?? ""} onChange={v => setCompareAtPrice(v === "" ? "" : toNum(v))} min={0} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">세일 시작</label>
                  <input type="datetime-local" className="input w-full" value={saleStart} onChange={(e)=>setSaleStart(e.target.value)} />
                </div>
                <div>
                  <label className="label">세일 종료</label>
                  <input type="datetime-local" className="input w-full" value={saleEnd} onChange={(e)=>setSaleEnd(e.target.value)} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="옵션 → 변형(Variants)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="색상 목록" value={colorsInput} onChange={setColorsInput} placeholder="예) Black" />
              <TextField label="사이즈 목록(쉼표)" value={sizesInput} onChange={setSizesInput} placeholder="예) S, M, L" />
            </div>
            <div className="mt-3">
              <button onClick={buildVariants} className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">변형 생성</button>
            </div>

            {!!variants.length && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">색상</th>
                      <th className="py-2 pr-4">사이즈</th>
                      <th className="py-2 pr-4">SKU</th>
                      <th className="py-2 pr-4">재고</th>
                      <th className="py-2 pr-4 text-right">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={v.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{v.color}</td>
                        <td className="py-2 pr-4">{v.size}</td>
                        <td className="py-2 pr-4"><input className="w-40 input" value={v.sku} onChange={e=>setVariants(prev=>prev.map((x,i)=>i===idx?{...x, sku:e.target.value}:x))} /></td>
                        <td className="py-2 pr-4"><input type="number" className="w-24 input" min={0} value={v.stock} onChange={e=>setVariants(prev=>prev.map((x,i)=>i===idx?{...x, stock: toNum(e.target.value)}:x))} /></td>
                        <td className="py-2 pr-4 text-right"><button className="px-2 py-1 text-xs border rounded-lg" onClick={()=>setVariants(prev=>prev.filter((_,i)=>i!==idx))}>삭제</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="상세 설명">
            <textarea className="w-full input h-40 resize-y" placeholder="제품 스토리, 원단/세탁법, 핏 정보 등" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </Section>

          <Section title="제품 상세정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="두께" value={details.thickness || ""} onChange={v=>setDetails(d=>({...d, thickness: (v||undefined) as any}))} options={[["", "선택"],["very_thick","매우 두꺼움"],["thick","두꺼움"],["normal","적당"],["thin","얇음"],["very_thin","매우 얇음"]]} />
              <SelectField label="신축성" value={details.elasticity || ""} onChange={v=>setDetails(d=>({...d, elasticity: (v||undefined) as any}))} options={[["", "선택"],["very_high","매우 높음"],["high","높음"],["normal","적당"],["low","낮음"],["none","없음"]]} />
              <SelectField label="비침" value={details.transparency || ""} onChange={v=>setDetails(d=>({...d, transparency: (v||undefined) as any}))} options={[["", "선택"],["very_high","매우 큼"],["high","큼"],["normal","적당"],["low","적음"],["none","없음"]]} />
              <SelectField label="안감" value={details.lining || ""} onChange={v=>setDetails(d=>({...d, lining: (v||undefined) as any}))} options={[["", "선택"],["full","전체 안감"],["partial","부분 안감"],["none","없음"]]} />
            </div>
          </Section>
        </div>

        {/* 우측 1열 */}
        <div className="space-y-6">
          <Section title="노출 설정">
            <div className="grid grid-cols-1 gap-3">
              <SelectField label="상태" value={status} onChange={v=>setStatus(v as any)} options={[["draft","임시저장"],["published","게시"]]} />
              <div>
                <label className="label">공개 시작(선택)</label>
                <input type="datetime-local" className="input w-full" value={visibleFrom} onChange={(e)=>setVisibleFrom(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">설정 시 해당 시각부터 상품이 노출됩니다.</p>
              </div>
            </div>
          </Section>



          <Section title="SEO">
            <TextField label="SEO 제목" value={seoTitle} onChange={setSeoTitle} placeholder="검색 결과에 표시될 제목" />
            <div className="mt-3">
              <label className="label">SEO 설명</label>
              <textarea className="input w-full h-28" placeholder="검색 결과에 표시될 설명" value={seoDescription} onChange={(e)=>setSeoDescription(e.target.value)} />
            </div>
          </Section>
        </div>
      </div>

      <footer className="sticky bottom-0 left-0 right-0 bg-white/70 backdrop-blur border-t mt-6 py-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">대표 이미지 1장 이상, 옵션 생성 및 변형 테이블 입력을 확인하세요.</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setStatus("draft")} className="px-3 py-2 rounded-xl border bg-white">임시저장</button>
            <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-black text-white">저장하기</button>
          </div>
        </div>
      </footer>

      <style>{`
        .label { @apply block text-sm font-medium mb-1; }
        .input { @apply border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10; }
      `}</style>
    </div>
  );
}

// ---------- 공통 컴포넌트 ----------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 sm:p-5 border rounded-2xl bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input className="input w-full" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function NumberField({ label, value, onChange, min, required }: {
  label: string; value: number | string; onChange: (v: string) => void; min?: number; required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type="number" className="input w-full" value={value} onChange={(e)=>onChange(e.target.value)} min={min} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string,string][];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input w-full" value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}



