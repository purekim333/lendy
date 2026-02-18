import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAccess } from "../../../util/fetchUtil";
import Toast from "../../../components/admin/Toast";
import LoadingSpinner from "../../../components/admin/LoadingSpinner";

type Variant = {
  id: string;
  color: string;
  size: string;
  stock: number;
};

const toNum = (v: string, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 기본
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tops");
  const [tagsInput, setTagsInput] = useState("");

  // 가격
  const [price, setPrice] = useState<number | "">("");
  const [rentalPrice, setRentalPrice] = useState<number | "">("");

  // 옵션/변형
  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);

  // 상세
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<Record<string, number>>({});

  // 노출
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // 이미지 - 기존 URL + 새 파일
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const tags = useMemo(() => tagsInput.split(",").map(t => t.trim()).filter(Boolean), [tagsInput]);
  const colors = useMemo(() => colorsInput.split(",").map(t => t.trim()).filter(Boolean), [colorsInput]);
  const sizes = useMemo(() => sizesInput.split(",").map(t => t.trim()).filter(Boolean), [sizesInput]);

  // 상품 데이터 로드
  useEffect(() => {
    if (!id) return;
    fetchWithAccess(`/api/v1/admin/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("상품을 찾을 수 없습니다.");
        return res.json();
      })
      .then(data => {
        setTitle(data.productName || "");
        setCategory(data.type || "Tops");
        setTagsInput(data.tag || "");
        setPrice(data.buyPrice || "");
        setRentalPrice(data.rentalPrice || "");
        setColorsInput(data.color || "");
        setDescription(data.description || "");
        setDetails({
          thickness: data.thickness || 1,
          elasticity: data.elasticity || 1,
          lining: data.lining || 1,
          handFeel: data.handFeel || 1,
          seeThrough: data.seeThrough || 1,
        });
        setExistingImages(data.imageUrls || []);
        setStatus(data.isPublished ? "published" : "draft");

        // 옵션 → variants
        if (data.options && data.options.length > 0) {
          const uniqueSizes = [...new Set(data.options.map((o: any) => o.size))];
          setSizesInput(uniqueSizes.join(", "));
          setVariants(
            data.options.map((o: any) => ({
              id: `${data.color || "default"}-${o.size}`,
              color: data.color || "default",
              size: o.size,
              stock: o.count,
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setToast({ type: "error", message: "상품 정보를 불러올 수 없습니다." });
        setLoading(false);
      });
  }, [id]);

  // 변형 생성
  const buildVariants = () => {
    const next: Variant[] = [];
    for (const c of colors) {
      for (const s of sizes) {
        const vid = `${c}-${s}`;
        const exist = variants.find(v => v.id === vid);
        next.push(exist ?? { id: vid, color: c, size: s, stock: 100 });
      }
    }
    setVariants(next);
  };

  // 새 이미지 업로드
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewImages(prev => [...prev, ...arr]);
    arr.forEach(f => setNewPreviews(prev => [...prev, URL.createObjectURL(f)]));
  };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const removeExistingImage = (i: number) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i));
  };
  const removeNewImage = (i: number) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== i));
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // 검증
  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("상품명을 입력하세요.");
    if (!category.trim()) errs.push("카테고리를 입력하세요.");
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) errs.push("판매가를 0보다 크게 입력하세요.");
    if (!variants.length) errs.push("변형(variants)이 없습니다.");
    if (!existingImages.length && !newImages.length) errs.push("이미지를 최소 1장 등록하세요.");
    return errs;
  };

  // 제출
  const onSubmit = async () => {
    const errs = validate();
    if (errs.length) {
      setToast({ type: "error", message: errs.join(", ") });
      return;
    }

    setSaving(true);
    const primaryColor = colors[0] || "Black";
    const primaryTag = tags[0] || "Daily";

    const optionsPayload = variants.map(v => ({
      size: v.size,
      count: v.stock,
      buyPrice: price,
      rentalPrice: rentalPrice || 0,
    }));

    const payload = {
      name: title,
      type: category,
      tag: primaryTag,
      color: primaryColor,
      buyPrice: Number(price),
      rentalPrice: Number(rentalPrice) || 0,
      description,
      thickness: details.thickness || 1,
      elasticity: details.elasticity || 1,
      lining: details.lining || 1,
      handFeel: details.handFeel || 1,
      seeThrough: details.seeThrough || 1,
      isPublished: status === "published",
      keepImageUrls: existingImages,
      options: optionsPayload,
    };

    const form = new FormData();
    form.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    newImages.forEach((f, i) => form.append("images", f, f.name || `image-${i}.jpg`));

    try {
      const res = await fetchWithAccess(`/api/v1/admin/products/${id}`, { method: "PUT", body: form });
      if (!res.ok) throw new Error(await res.text());
      setToast({ type: "success", message: "상품이 수정되었습니다." });
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (e: any) {
      setToast({ type: "error", message: "수정 실패: " + (e?.message || "알 수 없는 오류") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="상품 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/products")} className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm">
            ← 목록
          </button>
          <h1 className="text-2xl font-semibold">상품 수정</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatus("draft")}
            className={`px-3 py-2 rounded-xl border text-sm ${status === "draft" ? "bg-gray-100" : "bg-white"}`}
          >
            미게시
          </button>
          <button
            onClick={() => setStatus("published")}
            className={`px-3 py-2 rounded-xl border text-sm ${status === "published" ? "bg-emerald-50 border-emerald-300" : "bg-white"}`}
          >
            게시
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 text-sm disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="상품명" required>
                <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="예) 레트로 그래픽 반팔 티셔츠" />
              </FormField>
              <FormField label="카테고리">
                <select className="input w-full" value={category} onChange={e => setCategory(e.target.value)}>
                  {["Tops", "Bottoms", "Outers"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="태그">
                <input className="input w-full" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="예) Daily, Travel" />
              </FormField>
            </div>
          </Section>

          <Section title="이미지">
            {/* 기존 이미지 */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">기존 이미지</p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((url, i) => (
                    <li key={url} className="relative group">
                      <img src={url} alt={`existing-${i}`} className="w-full h-32 object-cover rounded-xl border" />
                      {i === 0 && <span className="absolute top-1 left-1 bg-black text-white text-xs px-2 py-0.5 rounded-lg">대표</span>}
                      <button
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 새 이미지 업로드 */}
            <div ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} className="border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-50">
              <p className="mb-3 text-sm text-gray-600">새 이미지를 드래그 앤 드롭하거나 파일을 선택하세요.</p>
              <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
            </div>
            {newPreviews.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {newPreviews.map((src, i) => (
                  <li key={src} className="relative group">
                    <img src={src} alt="new-preview" className="w-full h-32 object-cover rounded-xl border" />
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-lg">새 이미지</span>
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="가격">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="판매가 (Buy Price)" required>
                <input type="number" className="input w-full" value={price} onChange={e => setPrice(e.target.value === "" ? "" : toNum(e.target.value))} min={0} />
              </FormField>
              <FormField label="대여가 (Rental Price)">
                <input type="number" className="input w-full" value={rentalPrice} onChange={e => setRentalPrice(e.target.value === "" ? "" : toNum(e.target.value))} min={0} />
              </FormField>
            </div>
          </Section>

          <Section title="옵션 → 변형(Variants)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="색상 목록">
                <input className="input w-full" value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="예) Black" />
              </FormField>
              <FormField label="사이즈 목록 (쉼표)">
                <input className="input w-full" value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="예) S, M, L" />
              </FormField>
            </div>
            <div className="mt-3">
              <button onClick={buildVariants} className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm">변형 생성</button>
            </div>

            {variants.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">색상</th>
                      <th className="py-2 pr-4">사이즈</th>
                      <th className="py-2 pr-4">재고</th>
                      <th className="py-2 pr-4 text-right">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={v.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{v.color}</td>
                        <td className="py-2 pr-4">{v.size}</td>
                        <td className="py-2 pr-4">
                          <input type="number" className="w-24 input" min={0} value={v.stock} onChange={e => setVariants(prev => prev.map((x, i) => i === idx ? { ...x, stock: toNum(e.target.value) } : x))} />
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <button className="px-2 py-1 text-xs border rounded-lg hover:bg-red-50" onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}>삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="상세 설명">
            <textarea className="w-full input h-40 resize-y" placeholder="제품 스토리, 원단/세탁법, 핏 정보 등" value={description} onChange={e => setDescription(e.target.value)} />
          </Section>

          <Section title="제품 상세정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="두께 (1:두꺼움 ~ 3:얇음)">
                <select className="input w-full" value={details.thickness || ""} onChange={e => setDetails(d => ({ ...d, thickness: toNum(e.target.value) }))}>
                  <option value="1">1 (두꺼움)</option>
                  <option value="2">2 (보통)</option>
                  <option value="3">3 (얇음)</option>
                </select>
              </FormField>
              <FormField label="신축성">
                <select className="input w-full" value={details.elasticity || ""} onChange={e => setDetails(d => ({ ...d, elasticity: toNum(e.target.value) }))}>
                  <option value="1">1 (좋음)</option>
                  <option value="2">2 (보통)</option>
                  <option value="3">3 (없음)</option>
                </select>
              </FormField>
              <FormField label="안감">
                <select className="input w-full" value={details.lining || ""} onChange={e => setDetails(d => ({ ...d, lining: toNum(e.target.value) }))}>
                  <option value="1">1 (있음)</option>
                  <option value="2">2 (부분)</option>
                  <option value="3">3 (없음)</option>
                </select>
              </FormField>
              <FormField label="촉감">
                <select className="input w-full" value={details.handFeel || ""} onChange={e => setDetails(d => ({ ...d, handFeel: toNum(e.target.value) }))}>
                  <option value="1">1 (부드러움)</option>
                  <option value="2">2 (보통)</option>
                  <option value="3">3 (거침)</option>
                </select>
              </FormField>
              <FormField label="비침">
                <select className="input w-full" value={details.seeThrough || ""} onChange={e => setDetails(d => ({ ...d, seeThrough: toNum(e.target.value) }))}>
                  <option value="1">1 (없음)</option>
                  <option value="2">2 (약간)</option>
                  <option value="3">3 (있음)</option>
                </select>
              </FormField>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="노출 설정">
            <FormField label="상태">
              <select className="input w-full" value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="draft">미게시</option>
                <option value="published">게시</option>
              </select>
            </FormField>
          </Section>
        </div>
      </div>

      <footer className="sticky bottom-0 left-0 right-0 bg-white/70 backdrop-blur border-t mt-6 py-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-3">
          <button onClick={() => navigate("/admin/products")} className="px-3 py-2 rounded-xl border bg-white text-sm hover:bg-gray-50">
            ← 목록으로
          </button>
          <button onClick={onSubmit} disabled={saving} className="px-4 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50">
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </footer>

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
        .input { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.5rem 0.75rem; outline: none; }
        .input:focus { box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 sm:p-5 border rounded-2xl bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  );
}
