'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ReactCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';

import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiCropLine,
  RiDeleteBin6Line,
  RiDownloadLine,
  RiFullscreenLine,
  RiImageLine,
  RiLightbulbFlashLine,
  RiMagicLine,
  RiPencilLine,
  RiRefreshLine,
  RiSearchEyeLine,
  RiSparklingLine,
  RiUpload2Line,
  RiZoomInLine,
  RiZoomOutLine,
} from '@remixicon/react';

import { processImageWithClarity } from '@/lib/clarityImageProcess';
// import { toast } from 'react-hot-toast';

import * as Avatar from '@/components/ui/avatar';
import * as Button from '@/components/ui/button';
import * as Textarea from '@/components/ui/textarea';
import Header from '@/components/header';
import { MoveMoneyButton } from '@/components/move-money-button';
import * as WidgetBox from '@/components/widget-box';

// Result image type
type ResultImage = {
  id: number;
  url: string;
  description: string;
  savedPath: string;
  loading: boolean;
  supabaseUrl?: string; // Supabase URL'si için yeni alan ekledim
  transparentBgUrl?: string; // Arkaplanı kaldırılmış resim URL'i
};

// Clarity işlem kaydı tipi
type ClarityProcessRecord = {
  timestamp: number;
  imageUrl: string;
  description: string;
  processingTime: number;
};

// Widget for source image and prompt
function WidgetSourceAndPrompt({
  onImageUpload,
  previewUrl,
  handleFileChange,
  prompt,
  handlePromptChange,
  isGenerating,
  isDisabled,
  handleGenerate,
  handleSamplePromptClick,
  openCropModal,
  resetUpload,
  error,
  className,
}: {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prompt: string;
  handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isGenerating: boolean;
  isDisabled: boolean;
  handleGenerate: () => void;
  handleSamplePromptClick: (prompt: string) => void;
  openCropModal: () => void;
  resetUpload: () => void;
  error: string | null;
  className?: string;
}) {
  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiImageLine} />
        <span>Ürün Rötuşlama</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-6'>
        {/* Fotoğraf Yükleme Bölümü */}
        <div>
          <h3 className='text-label-sm text-text-sub-600 mb-3'>
            Kaynak Fotoğraf
          </h3>
          <div className='border-2 border-dashed border-stroke-soft-200 rounded-lg mb-2'>
            {previewUrl ? (
              <div className='p-4'>
                <div
                  className='relative w-full mx-auto flex items-center justify-center bg-white border border-stroke-soft-200 rounded-lg overflow-hidden'
                  style={{ height: '240px' }}
                >
                  <div className='absolute inset-0 bg-white'></div>
                  <img
                    src={previewUrl}
                    alt='Ürün önizleme'
                    className='max-h-full max-w-full object-contain z-10 relative'
                    style={{
                      display: 'block',
                    }}
                  />
                </div>

                <div className='flex gap-2 justify-center mt-3'>
                  <Button.Root
                    variant='neutral'
                    mode='stroke'
                    size='small'
                    onClick={openCropModal}
                  >
                    <Button.Icon as={RiCropLine} />
                    Yeniden Kırp
                  </Button.Root>
                  <Button.Root
                    variant='neutral'
                    mode='stroke'
                    size='small'
                    onClick={resetUpload}
                  >
                    Değiştir
                  </Button.Root>
                </div>
              </div>
            ) : (
              <label
                htmlFor='jewelry-image'
                className='cursor-pointer flex flex-col items-center justify-center gap-3 h-52 p-4'
              >
                <div className='w-16 h-16 bg-bg-weak-50 rounded-full flex items-center justify-center text-text-sub-600'>
                  <RiUpload2Line className='size-8' />
                </div>
                <span className='text-base text-text-sub-600'>
                  Fotoğraf yüklemek için buraya tıklayın
                </span>
                <span className='text-sm text-text-soft-400'>
                  veya sürükle & bırak
                </span>
                <input
                  type='file'
                  id='jewelry-image'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </label>
            )}
          </div>
        </div>

        {/* Rötuş Yönergesi Bölümü */}
        <div>
          <h3 className='text-label-sm text-text-sub-600 mb-3'>
            Ürün Açıklaması
          </h3>
          <div className='space-y-2 text-paragraph-xs text-text-soft-600'>
            <div className='mb-3 space-y-1'>
              <Textarea.Root
                value={prompt}
                onChange={handlePromptChange}
                id='prompt'
                placeholder='Ürünü detaylı bir şekilde açıklayın (malzeme, renk, doku, tasarım detayları vs.)'
                className='h-32 w-full'
              />
            </div>

            {error && <p className='text-error-base text-sm mt-2'>{error}</p>}

            <Button.Root
              variant='primary'
              mode='filled'
              size='medium'
              onClick={handleGenerate}
              disabled={isDisabled}
              className='w-full mt-4'
            >
              {isGenerating ? 'İşleniyor...' : 'Fotoğrafı Rötuşla'}
              <Button.Icon as={RiArrowRightLine} />
            </Button.Root>
          </div>
        </div>
      </div>
    </WidgetBox.Root>
  );
}

// Widget for all results
function WidgetResults({
  resultImages,
  onSelectResult,
  selectedIndex,
  openCropModal,
  onEditPrompt,
  upscalingIndex,
  clarityProcessHistory,
  className,
  onClarityStart,
  onRemoveBg,
  removingBgIndex,
}: {
  resultImages: ResultImage[] | null;
  onSelectResult: (index: number) => void;
  selectedIndex: number;
  openCropModal: () => void;
  onEditPrompt: (index: number, description: string) => void;
  upscalingIndex: number | null;
  clarityProcessHistory: ClarityProcessRecord[];
  className?: string;
  onClarityStart: (index: number, imageUrl: string) => void;
  onRemoveBg: (index: number, imageUrl: string) => void;
  removingBgIndex: number | null;
}) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Kopyalama feedback'i göster ve sonra gizle
  const showCopyFeedback = () => {
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Süreyi formatlama (Geçmiş tablosu için)
  const formatTime = (seconds: number) => {
    if (seconds === undefined || isNaN(seconds)) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Güvenli indirme fonksiyonu - React tarzında güncellendi, DOM manipülasyonu yok
  const safeDownloadImage = (url: string, filename: string) => {
    try {
      console.log(`Dosya indiriliyor: ${filename}`);

      // Blob URL oluşturma ve indirme işlemi
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`İndirme başarısız: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          // Geçici URL oluştur
          const blobUrl = URL.createObjectURL(blob);

          // İndirme linki oluştur
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename; // Dosyanın indirileceğini belirtir
          link.style.display = 'none'; // Görünmez yap

          // Tıklama işlemi
          document.body.appendChild(link);
          link.click();

          // Temizlik
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl); // Belleği temizle
          }, 200);
        })
        .catch((error) => {
          console.error('İndirme hatası:', error);
          alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
        });
    } catch (error) {
      console.error('İndirme işlemi başarısız:', error);
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Tam ekran modalı açma fonksiyonu
  const handleOpenFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  // Arkaplanı kaldırılmış resimler bölümü
  const transparentBgImages =
    resultImages?.filter((img) => img.transparentBgUrl) || [];

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiSparklingLine} />
        <span>Rötuşlanmış Sonuçlar</span>
        {resultImages && resultImages.length > 0 && (
          <span className='ml-auto text-paragraph-xs text-text-soft-400'>
            {resultImages.length} sonuç
          </span>
        )}
      </WidgetBox.Header>

      {!resultImages ? (
        <div className='grid grid-cols-2 gap-4 py-10'>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className='aspect-square border border-dashed border-stroke-soft-200 rounded-lg flex flex-col items-center justify-center text-text-soft-400 bg-bg-weak-50'
            >
              <RiImageLine className='size-8 mb-2' />
            </div>
          ))}
          <div className='col-span-2 text-center mt-4 text-paragraph-xs text-text-soft-400'>
            Fotoğraf yükleyip rötuşlamayı deneyin. Sistem 4 farklı sonuç
            oluşturacaktır.
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Tüm sonuçları 2x2 grid olarak göster */}
          <div className='grid grid-cols-2 gap-4'>
            {resultImages.map((image, index) => (
              <div
                key={image.id}
                className={`cursor-pointer transition-all duration-200 rounded-lg overflow-hidden relative group ${
                  index === selectedIndex
                    ? 'ring-4 ring-primary-base ring-opacity-30'
                    : 'hover:ring-2 hover:ring-primary-base/40'
                }`}
              >
                <div
                  className='aspect-square border border-stroke-soft-200 bg-bg-weak-50 relative'
                  onClick={() => {
                    if (!image.loading) onSelectResult(index);
                  }}
                >
                  {image.loading ? (
                    // Yükleme durumunda spinner göster
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-10 h-10 border-t-2 border-b-2 border-primary-base rounded-full animate-spin'></div>
                      <span className='absolute mt-16 text-xs text-text-soft-400'>
                        {`Stil ${index + 1} yükleniyor`}
                      </span>
                    </div>
                  ) : (
                    // Yükleme tamamlandığında görüntüyü göster
                    <img
                      src={image.url}
                      alt={`Sonuç görsel ${index + 1}`}
                      className='w-full h-full object-contain rounded-lg'
                    />
                  )}
                </div>

                {/* Mouse hover üzerinde beliren butonlar - sadece yükleme tamamlandığında göster */}
                {!image.loading && (
                  <div className='absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    {/* Butonlar: Fullscreen, Edit Prompt, Crop, Download */}
                    <button
                      className='bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFullscreen(image.url);
                      }}
                    >
                      <RiFullscreenLine className='size-4 text-text-sub-600' />
                    </button>
                    <button
                      className='bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (resultImages && resultImages[index]) {
                          onEditPrompt(index, resultImages[index].description);
                        }
                      }}
                    >
                      <RiPencilLine className='size-4 text-text-sub-600' />
                    </button>
                    <button
                      className='bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation();
                        openCropModal();
                      }}
                    >
                      <RiCropLine className='size-4 text-text-sub-600' />
                    </button>
                    <button
                      className='bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation();
                        safeDownloadImage(
                          image.url,
                          `retouch-result-${index + 1}.jpg`,
                        );
                      }}
                    >
                      <RiDownloadLine className='size-4 text-text-sub-600' />
                    </button>
                  </div>
                )}

                {/* Alt kısımdaki butonlar (Clarity AI + Download PNG) */}
                {!image.loading && image.supabaseUrl && (
                  <div className='absolute bottom-2 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2'>
                    <div className='flex flex-col gap-1'>
                      {/* Clarity AI butonu */}
                      <button
                        className='w-full bg-purple-600/90 backdrop-blur-sm text-white py-1.5 rounded-md text-xs font-medium shadow-lg hover:bg-purple-600 hover:scale-105 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={upscalingIndex === index} // Clarity işlemi sürüyorsa butonu devre dışı bırak
                        onClick={(e) => {
                          e.stopPropagation();
                          if (image.supabaseUrl) {
                            // Ana bileşene işlemi başlatma sinyali gönder
                            onClarityStart(index, image.supabaseUrl);
                          }
                        }}
                      >
                        {upscalingIndex === index ? (
                          <>
                            <span className='inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5'></span>
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <RiMagicLine className='size-4' />
                            Netleştirme
                          </>
                        )}
                      </button>

                      {/* Download PNG (Arkaplan Kaldırma) butonu */}
                      <button
                        className='w-full bg-green-600/90 backdrop-blur-sm text-white py-1.5 rounded-md text-xs font-medium shadow-lg hover:bg-green-600 hover:scale-105 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mt-1'
                        disabled={
                          removingBgIndex === index || !image.supabaseUrl
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (image.supabaseUrl) {
                            onRemoveBg(index, image.supabaseUrl);
                          }
                        }}
                      >
                        {removingBgIndex === index ? (
                          <>
                            <span className='inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5'></span>
                            Arkaplan Kaldırılıyor...
                          </>
                        ) : (
                          <>
                            <RiDownloadLine className='size-4' />
                            Download PNG
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arkaplanı Kaldırılmış Görüntüler Bölümü */}
      {transparentBgImages.length > 0 && (
        <div className='mt-6'>
          <div className='flex items-center gap-2 mb-2'>
            <RiDownloadLine className='size-4 text-green-600' />
            <h3 className='text-paragraph-sm font-medium'>
              Arkaplanı Kaldırılmış Görüntüler
            </h3>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            {transparentBgImages.map((image, idx) => (
              <div
                key={`transparent-${image.id}`}
                className='border border-stroke-soft-200 rounded-lg overflow-hidden'
              >
                <div className='aspect-square bg-[url("/images/transparent-grid.png")] bg-opacity-30 relative'>
                  {image.transparentBgUrl && (
                    <img
                      src={image.transparentBgUrl}
                      alt={`Arkaplanı kaldırılmış görüntü ${idx + 1}`}
                      className='w-full h-full object-contain'
                    />
                  )}
                </div>
                <div className='p-2 bg-bg-weak-50 border-t border-stroke-soft-200 flex justify-between items-center'>
                  <div className='text-xs font-medium text-text-sub-600'>
                    Stil {image.id}
                  </div>
                  <button
                    className='text-xs font-medium text-green-600 flex items-center gap-1 hover:text-green-700 transition-colors'
                    onClick={() => {
                      if (image.transparentBgUrl) {
                        safeDownloadImage(
                          image.transparentBgUrl,
                          `transparent-bg-${image.id}.png`,
                        );
                      }
                    }}
                  >
                    <RiDownloadLine className='size-3' />
                    İndir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clarity AI İşlemleri Geçmişi */}
      {clarityProcessHistory.length > 0 && (
        <div className='mt-6'>
          <div className='flex items-center gap-2 mb-2'>
            <RiMagicLine className='size-4 text-purple-600' />
            <h3 className='text-paragraph-sm font-medium'>
              Netleştirme Geçmişi
            </h3>
          </div>
          <div className='border border-stroke-soft-200 rounded-lg overflow-hidden'>
            <table className='w-full text-paragraph-xs'>
              <thead className='bg-bg-weak-50'>
                <tr>
                  <th className='p-2 text-left text-text-sub-600 font-medium'>
                    Tarih
                  </th>
                  <th className='p-2 text-left text-text-sub-600 font-medium'>
                    İşlem
                  </th>
                  <th className='p-2 text-left text-text-sub-600 font-medium'>
                    Süre
                  </th>
                  <th className='p-2 text-center text-text-sub-600 font-medium'>
                    Görüntü
                  </th>
                </tr>
              </thead>
              <tbody>
                {clarityProcessHistory.map((record, index) => (
                  <tr
                    key={`${record.timestamp}-${record.imageUrl}`}
                    className={index % 2 === 0 ? '' : 'bg-bg-weak-50/50'}
                  >
                    <td className='p-2 text-text-sub-600'>
                      {new Date(record.timestamp).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className='p-2 text-text-sub-600'>
                      {record.description}
                    </td>
                    <td className='p-2 text-text-sub-600'>
                      {formatTime(record.processingTime)}
                    </td>
                    <td className='p-2 flex justify-center'>
                      <button
                        onClick={() => handleOpenFullscreen(record.imageUrl)}
                        className='block w-10 h-10 relative overflow-hidden rounded border border-stroke-soft-200 cursor-pointer hover:ring-2 hover:ring-purple-400'
                      >
                        <img
                          src={record.imageUrl}
                          alt='Netleştirilmiş görüntü'
                          className='w-full h-full object-cover'
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-2 text-paragraph-2xs text-text-soft-400'>
            Ortalama İşlem Süresi:{' '}
            {clarityProcessHistory.length > 0
              ? formatTime(
                  Math.round(
                    clarityProcessHistory.reduce(
                      (sum, record) => sum + record.processingTime,
                      0,
                    ) / clarityProcessHistory.length,
                  ),
                )
              : '-'}
          </div>
        </div>
      )}

      {/* Tam ekran modal */}
      <FullscreenImageModal
        isOpen={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
        imageUrl={fullscreenImage}
      />

      {/* Kopyalama başarılı mesajı */}
      {copyFeedback && (
        <div className='fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center'>
          <RiCheckLine className='mr-2' />
          Resim linki kopyalandı!
        </div>
      )}
    </WidgetBox.Root>
  );
}

// Kırpma Modalı Bileşeni - React Image Crop kullanacak şekilde düzenlendi
function CropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onCropComplete: (croppedFile: File) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspect, setSelectedAspect] = useState('square');
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  // Aspect ratio seçenekleri
  const aspectOptions = [
    {
      id: 'square',
      label: 'Kare',
      aspectRatio: 1,
      description: 'E-ticaret',
      size: { width: 3072, height: 3072 },
    },
    {
      id: 'product',
      label: '4:3',
      aspectRatio: 4 / 3,
      description: 'Ürün',
      size: { width: 3072, height: 2304 },
    },
    {
      id: 'wide',
      label: '16:9',
      aspectRatio: 16 / 9,
      description: 'Banner',
      size: { width: 3072, height: 1728 },
    },
    {
      id: 'portrait',
      label: '3:4',
      aspectRatio: 3 / 4,
      description: 'Portre',
      size: { width: 2304, height: 3072 },
    },
    {
      id: 'story',
      label: '9:16',
      aspectRatio: 9 / 16,
      description: 'Hikaye',
      size: { width: 1728, height: 3072 },
    },
  ];

  // Seçili aspect ratio'yu bul
  const selectedAspectOption =
    aspectOptions.find((option) => option.id === selectedAspect) ||
    aspectOptions[0];

  // Görüntü yüklendiğinde başlangıç kırpma alanını ayarla
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;

      // Görüntüyü ortala
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80, // Görüntünün %80'ini kapla
          },
          selectedAspectOption.aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );

      setCrop(crop);
    },
    [selectedAspectOption.aspectRatio],
  );

  // Aspect Ratio değiştiğinde kırpma alanını güncelle
  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;

      // Görüntüyü ortala ve yeni aspect ratio'ya göre ayarla
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80, // Görüntünün %80'ini kapla
          },
          selectedAspectOption.aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );

      setCrop(crop);
    }
  }, [selectedAspect, selectedAspectOption.aspectRatio]);

  // Aspect ratio değiştirme işleyicisi
  const handleAspectChange = (aspectId: string) => {
    setSelectedAspect(aspectId);
  };

  // Zoom işlevleri
  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 3));
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    setRotate(0);
    // Kırpma alanını sıfırla
    if (imgRef.current) {
      onImageLoad({
        currentTarget: imgRef.current,
      } as React.SyntheticEvent<HTMLImageElement>);
    }
  };

  // Kırpma işlemini tamamla - Son derece basitleştirilmiş versiyon
  const handleSave = () => {
    if (!imageUrl) return;

    console.log('Kırpma onaylandı');

    // Önce modalı kapat
    onClose();

    // Asenkron işlem
    (async () => {
      try {
        // Görüntüyü al
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Görüntü alınamadı: ${response.status}`);
        }

        // Blob oluştur
        const blob = await response.blob();
        console.log('Dosya oluşturuldu, boyut:', blob.size);

        // File oluştur
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });

        // Callback'i çağır
        onCropComplete(file);
      } catch (error) {
        console.error('Görüntü işlenemedi:', error);
        // Hata durumunda kullanıcıya bilgi verebiliriz
      }
    })();
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black flex flex-col'>
      {/* Üst kontrol çubuğu */}
      <div className='bg-gradient-to-b from-black/80 to-transparent p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <button
              onClick={onClose}
              className='text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors'
            >
              <RiCloseLine className='size-5' />
            </button>
            <h3 className='text-lg font-medium text-white ml-2'>
              Fotoğrafı Düzenle
            </h3>
          </div>
          <div className='text-white text-sm bg-black/40 px-3 py-1 rounded-full'>
            {Math.round(scale * 100)}%
          </div>
        </div>
      </div>

      {/* Görüntü önizleme alanı */}
      <div className='flex-1 flex items-center justify-center p-4 relative overflow-hidden'>
        {/* Arka plan ızgara deseni */}
        <div className="absolute inset-0 bg-[url('/images/transparent-grid.png')] opacity-30"></div>

        {/* ReactCrop bileşeni */}
        <div className='relative'>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={selectedAspectOption.aspectRatio}
            minWidth={100}
            minHeight={100}
            circularCrop={false}
            keepSelection={true}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt='Düzenlenecek görüntü'
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                maxHeight: '70vh',
                maxWidth: '100%',
              }}
              onLoad={onImageLoad}
              className='transition-all duration-200'
            />
          </ReactCrop>
        </div>
      </div>

      {/* Sol panel - oran seçimi */}
      <div className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3'>
        <h4 className='text-xs font-medium text-white mb-3'>Oran</h4>
        <div className='flex flex-col gap-2'>
          {aspectOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAspectChange(option.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                selectedAspect === option.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span className='text-xs font-medium'>{option.label}</span>
              <span className='text-[10px] opacity-70'>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sağ panel - zoom kontrolleri */}
      <div className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3'>
        <div className='flex flex-col gap-3 items-center'>
          <button
            onClick={handleZoomIn}
            className='text-white hover:bg-white/20 active:bg-white/30 p-2 rounded-full transition-colors'
          >
            <RiZoomInLine className='size-5' />
          </button>

          <div className='text-white text-xs font-medium px-2 py-1'>
            {Math.round(scale * 100)}%
          </div>

          <button
            onClick={handleZoomOut}
            className='text-white hover:bg-white/20 active:bg-white/30 p-2 rounded-full transition-colors'
          >
            <RiZoomOutLine className='size-5' />
          </button>

          <button
            onClick={resetZoom}
            className='text-white hover:bg-white/20 active:bg-white/30 p-2 rounded-full transition-colors mt-2'
            title='Görüntüyü sıfırla'
          >
            <RiRefreshLine className='size-5' />
          </button>
        </div>
      </div>

      {/* Alt panel - kontroller */}
      <div className='bg-gradient-to-t from-black/80 to-transparent p-4'>
        <div className='flex justify-between items-center'>
          <div className='text-white text-sm opacity-80'>
            {selectedAspectOption.size.width} ×{' '}
            {selectedAspectOption.size.height} piksel
          </div>
          <div className='flex gap-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors text-sm'
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!completedCrop}
              className='px-4 py-2 rounded-md bg-primary-base hover:bg-primary-dark text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50'
            >
              <RiCheckLine className='size-4' />
              Kırpmayı Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tam ekran modal bileşeni
function FullscreenImageModal({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}) {
  const [scale, setScale] = useState(0.6); // Başlangıç ölçeği daha uzak (0.6)

  // Uzaklaştırma ve yakınlaştırma fonksiyonları
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.2));
  const resetZoom = () => setScale(0.6);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90'>
      <div className='relative w-full h-full flex flex-col'>
        <div className='absolute top-4 right-4 z-10'>
          <button
            onClick={onClose}
            className='bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all'
          >
            <RiCloseLine className='size-6 text-white' />
          </button>
        </div>

        {/* Zoom kontrolü sağ tarafta */}
        <div className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-2'>
          <button
            onClick={zoomIn}
            className='p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all'
          >
            <RiZoomInLine className='size-5' />
          </button>
          <div className='text-white text-xs font-medium bg-black bg-opacity-30 px-2 py-1 rounded text-center'>
            {Math.round(scale * 100)}%
          </div>
          <button
            onClick={zoomOut}
            className='p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all'
          >
            <RiZoomOutLine className='size-5' />
          </button>
          <button
            onClick={resetZoom}
            className='p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all mt-2'
          >
            <RiRefreshLine className='size-5' />
          </button>
        </div>

        <div className='flex-1 flex items-center justify-center p-4'>
          <div
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <img
              src={imageUrl}
              alt='Tam ekran görüntü'
              className='max-h-[90vh] max-w-[90vw] object-contain'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// EditPromptModal bileşeni - Düzenleme prompt'u gösteren modal
function EditPromptModal({
  isOpen,
  onClose,
  onApply,
  initialPrompt,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (prompt: string) => void;
  initialPrompt: string;
}) {
  const [editPrompt, setEditPrompt] = useState(initialPrompt);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'>
      <div className='bg-white rounded-lg w-[90vw] max-w-lg'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='text-lg font-medium'>Rötuş Açıklamasını Düzenle</h3>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-gray-100'
          >
            <RiCloseLine className='size-5' />
          </button>
        </div>

        <div className='p-4'>
          <Textarea.Root
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            className='min-h-[150px] w-full'
            placeholder='Rötuş açıklamasını düzenleyin...'
          />

          <div className='flex justify-end gap-2 mt-4'>
            <Button.Root
              variant='neutral'
              mode='stroke'
              size='medium'
              onClick={onClose}
            >
              İptal
            </Button.Root>
            <Button.Root
              variant='primary'
              mode='filled'
              size='medium'
              onClick={() => {
                onApply(editPrompt);
                onClose();
              }}
            >
              <Button.Icon as={RiCheckLine} />
              Uygula
            </Button.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageRetouchJewelry() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<ResultImage[] | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [removingBgIndex, setRemovingBgIndex] = useState<number | null>(null); // Arkaplanı kaldırma işlemi yapılan resmin index'i

  // Modal durumları
  const [showCropModal, setShowCropModal] = useState(false);
  const [showEditPromptModal, setShowEditPromptModal] = useState(false);
  const [editPromptIndex, setEditPromptIndex] = useState(0);
  const [editPromptText, setEditPromptText] = useState('');
  const [fullscreenPreview, setFullscreenPreview] = useState<string | null>(
    null,
  );
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [upscalingIndex, setUpscalingIndex] = useState<number | null>(null);
  const [clarityProcessHistory, setClarityProcessHistory] = useState<
    ClarityProcessRecord[]
  >([]);

  // Clarity AI için işlenen görüntüler (yeni state)
  const [clarityProcessingImages, setClarityProcessingImages] = useState<
    {
      index: number;
      startTime: number;
      originalImageUrl: string;
    }[]
  >([]);

  // Clarity AI zamanlayıcıları için (yeni state)
  const [clarityTimers, setClarityTimers] = useState<{ [key: number]: number }>(
    {},
  );
  const clarityTimerRef = useRef<{
    intervalIds: { [key: number]: NodeJS.Timeout };
  }>({ intervalIds: {} });

  // Component mount durumunu takip etmek için ref
  const isMounted = useRef(true);

  // Component unmount olduğunda cleanup işlemleri
  useEffect(() => {
    return () => {
      isMounted.current = false;

      // Tüm interval'ları temizle
      Object.values(clarityTimerRef.current.intervalIds).forEach((id) => {
        clearInterval(id);
      });
    };
  }, []);

  // Süre sayacı başlat (Clarity için)
  const startClarityTimer = (index: number) => {
    if (clarityTimerRef.current.intervalIds[index]) {
      clearInterval(clarityTimerRef.current.intervalIds[index]);
    }
    setClarityTimers((prev) => ({ ...prev, [index]: 0 }));
    const intervalId = setInterval(() => {
      setClarityTimers((prev) => ({
        ...prev,
        [index]: (prev[index] || 0) + 1,
      }));
    }, 1000);
    clarityTimerRef.current.intervalIds[index] = intervalId;
  };

  // Süre sayacını durdur (Clarity için)
  const stopClarityTimer = (index: number) => {
    if (clarityTimerRef.current.intervalIds[index]) {
      clearInterval(clarityTimerRef.current.intervalIds[index]);
      delete clarityTimerRef.current.intervalIds[index];
    }
  };

  // Süreyi formatlama (Clarity için)
  const formatTime = (seconds: number) => {
    if (seconds === undefined) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Tam ekran modalı açma fonksiyonu
  const handleOpenFullscreen = (imageUrl: string) => {
    setFullscreenPreview(imageUrl);
  };

  // Netleştirme işlemini başlatan fonksiyon
  const handleClarityStart = async (index: number, imageUrl: string) => {
    if (!imageUrl || !resultImages) return;

    try {
      const startTime = Date.now();

      // State güncellemelerini basitleştirelim
      setUpscalingIndex(index);
      setClarityProcessingImages((prev) => [
        ...prev,
        {
          index,
          startTime,
          originalImageUrl: imageUrl,
        },
      ]);
      startClarityTimer(index);

      console.log('Netleştirme işlemi başlatılıyor...', { index, imageUrl });

      // API çağrısı yap - try/catch içinde
      try {
        const clarityResponse: any = await processImageWithClarity(imageUrl, {
          mode: 'flux',
          creativity: 4,
          prompt: '',
        });

        console.log('API yanıtı alındı:', clarityResponse);

        // Yanıtı kontrol et
        if (!clarityResponse || !clarityResponse.upscaledImageUrl) {
          throw new Error('Netleştirme API yanıtı beklenen veriyi içermiyor.');
        }

        const { upscaledImageUrl, status, balance } = clarityResponse;
        const endTime = Date.now();
        const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

        // Timer'ı durdur
        stopClarityTimer(index);

        // Güvenli state güncellemeleri - Fonksiyonel formda
        setResultImages((prevResults) => {
          if (!prevResults) return null;

          return prevResults.map((image, idx) => {
            if (idx !== index) return image;

            // Orijinal açıklamayı koru, etiketleri temizle
            const originalDescription = image.description
              .replace(' (Netleştirme ile işlendi)', '')
              .replace(' (Clarity AI ile işlendi)', '');

            return {
              ...image,
              url: upscaledImageUrl,
              supabaseUrl: upscaledImageUrl,
              description: originalDescription + ' (Netleştirme ile işlendi)',
            };
          });
        });

        // Geçmiş kayıtlarını güncelle
        setClarityProcessHistory((prev) => [
          ...prev,
          {
            timestamp: endTime,
            imageUrl: upscaledImageUrl,
            description: `Stil ${index + 1} (Netleştirme)`,
            processingTime: processingTimeSeconds,
          },
        ]);

        // İşlenen görüntüyü işleme listesinden çıkar
        setClarityProcessingImages((prev) =>
          prev.filter((item) => item.index !== index),
        );

        // İşlem tamamlandığında index'i sıfırla
        setUpscalingIndex(null);

        // Seçili sonuç index'ini güncelle
        setSelectedResultIndex(index);

        console.log('Netleştirme işlemi başarıyla tamamlandı:', {
          status,
          balance,
          imageUrl: upscaledImageUrl,
          processingTime: processingTimeSeconds,
        });
      } catch (apiError) {
        console.error('API çağrısı sırasında hata:', apiError);
        throw apiError; // Dışarıdaki catch bloğuna ilet
      }
    } catch (error) {
      console.error('Netleştirme ile görüntü işleme hatası:', error);

      // Hata durumunda temizlik
      stopClarityTimer(index);
      setClarityProcessingImages((prev) =>
        prev.filter((item) => item.index !== index),
      );
      setUpscalingIndex(null);

      // Kullanıcıya hata mesajı göster (alert yerine state kullanılabilir)
      alert(
        'Görüntü işleme başarısız oldu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Lütfen bir görsel dosyası seçin (JPEG, PNG)');
        return;
      }
      setUploadedImage(selectedFile);
      setError(null);

      // Önizleme URL'i oluştur
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const imageUrl = fileReader.result as string;
        setPreviewUrl(imageUrl);
        // Kırpma modalını aç
        setShowCropModal(true);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setPreviewUrl(null);
    setResultImages(null);
    setError(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim()) {
      setError(null);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    console.log('Kırpma işlemi başladı', croppedFile);

    // Kırpılmış görüntüyü ana görüntü olarak ayarla
    setUploadedImage(croppedFile);

    // Eski URL'yi temizle ve bellekten serbest bırak
    if (previewUrl && previewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.error('URL.revokeObjectURL hatası:', err);
      }
    }

    try {
      // Güvenli şekilde yeni URL oluştur
      let newPreviewUrl;
      try {
        newPreviewUrl = URL.createObjectURL(croppedFile);
        console.log("Yeni önizleme URL'si oluşturuldu:", newPreviewUrl);
      } catch (urlError) {
        console.error('URL oluşturma hatası:', urlError);
        // Fallback: FileReader ile base64 URL oluştur
        const reader = new FileReader();
        reader.readAsDataURL(croppedFile);
        reader.onload = () => {
          const base64Url = reader.result as string;
          setPreviewUrl(base64Url);
          console.log("Base64 önizleme URL'si oluşturuldu");
        };
        return; // FileReader asenkron olduğu için burada çıkış yapıyoruz
      }

      // State'e ayarla
      setPreviewUrl(newPreviewUrl);

      // Sonuç verilerini sıfırla (yeni kırpılmış görüntü için)
      setResultImages(null);
    } catch (error) {
      console.error("Önizleme URL'si oluşturma hatası:", error);
      alert('Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Lütfen önce bir fotoğraf yükleyin');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSelectedResultIndex(0);

    // 4 farklı resim için yükleme durumlarını saklamak için bir dizi oluştur
    const tempResults: ResultImage[] = [
      {
        id: 1,
        url: '',
        description: 'Yükleniyor...',
        savedPath: '',
        loading: true,
      },
      {
        id: 2,
        url: '',
        description: 'Yükleniyor...',
        savedPath: '',
        loading: true,
      },
      {
        id: 3,
        url: '',
        description: 'Yükleniyor...',
        savedPath: '',
        loading: true,
      },
      {
        id: 4,
        url: '',
        description: 'Yükleniyor...',
        savedPath: '',
        loading: true,
      },
    ];
    // Boş sonuçları göster (sadece spinnerlar görünecek)
    setResultImages(tempResults);

    // 4 farklı stil için farklı promptlar
    const stylePrompts = [
      // Stil 1: Klasik temiz ürün fotoğrafı - Ürün detaylarını kullanacak
      '',

      // Stil 2: Altın/metal vurgusu - Gold tones enhancement
      '',

      // Stil 3: Dramatik kontrastlı aydınlatma
      '',

      // Stil 4: Taş/elmas parlaklığını vurgulama - Diamond/gem brilliance
      '',
    ];

    // 4 farklı isteği paralel olarak başlat
    const imageRequests = stylePrompts.map(async (stylePrompt, index) => {
      try {
        // Dosyayı FormData olarak hazırla
        const formData = new FormData();
        formData.append('image', uploadedImage);

        // İlk stil için ürün açıklamasını (productDetails) gönder, diğerleri için doğrudan prompt
        if (index === 0) {
          // Ürün detaylarını gönder (kullanıcının girdiği açıklama)
          if (prompt.trim()) {
            formData.append('productDetails', prompt.trim());
          }
        } else {
          // Diğer stiller için customPrompt parametresini boş olarak gönder
          formData.append('customPrompt', '');
        }

        // API çağrısını yap
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/gemini-process`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Görüntü ${index + 1} işlenirken bir hata oluştu.`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error ||
              `Görüntü ${index + 1} işlenirken bilinmeyen bir hata oluştu.`,
          );
        }

        // Supabase URL'leri varsa onları kullan, yoksa base64 verisi kullan
        if (result.supabaseUrls && result.supabaseUrls.length > 0) {
          const imageResult = {
            id: index + 1,
            // Görüntüyü göstermek için Supabase URL'sini kullan
            url: result.supabaseUrls[0],
            description: getStyleDescription(index),
            savedPath: result.savedImagePaths?.[0] || '',
            supabaseUrl: result.supabaseUrls[0],
            loading: false,
          };

          // Sonuçlar dizisini güncelle
          setResultImages((prevResults) => {
            if (!prevResults) return [imageResult];

            const newResults = [...prevResults];
            newResults[index] = imageResult;
            return newResults;
          });

          return imageResult;
        }
        // Supabase URL'i yoksa eski yöntem ile base64 verisi kullan
        else if (result.generatedImages && result.generatedImages.length > 0) {
          const imageResult = {
            id: index + 1,
            url: `data:${result.generatedImages[0].mimeType};base64,${result.generatedImages[0].data}`,
            description: getStyleDescription(index),
            savedPath: result.savedImagePaths?.[0] || '',
            loading: false,
          };

          // Sonuçlar dizisini güncelle
          setResultImages((prevResults) => {
            if (!prevResults) return [imageResult];

            const newResults = [...prevResults];
            newResults[index] = imageResult;
            return newResults;
          });

          return imageResult;
        }

        // Gemini görüntü döndürmediyse hata fırlat
        throw new Error(`Görüntü ${index + 1} için sonuç alınamadı.`);
      } catch (error) {
        console.error(`Görüntü ${index + 1} işleme hatası:`, error);

        // Hata durumunda orijinal görüntüyü kullan ama hata göster
        const errorResult = {
          id: index + 1,
          url: previewUrl as string,
          description: `Stil ${index + 1} işlenirken hata oluştu.`,
          savedPath: '',
          loading: false,
        };

        // Hatalı sonucu güncelle
        setResultImages((prevResults) => {
          if (!prevResults) return [errorResult];

          const newResults = [...prevResults];
          newResults[index] = errorResult;
          return newResults;
        });

        return errorResult;
      }
    });

    // Tüm isteklerin tamamlanmasını bekle
    try {
      await Promise.all(imageRequests);
    } finally {
      setIsGenerating(false);
    }
  };

  // Her stil için açıklama metni döndüren yardımcı fonksiyon
  const getStyleDescription = (styleIndex: number): string => {
    switch (styleIndex) {
      case 0:
        return 'Standart ürün rötuşu. Temiz beyaz arka plan, yumuşak doğal gölge ve parlaklık artırma işlemi uygulandı.';
      case 1:
        return 'Altın/metal vurgusu. Sıcak ton ve zengin metal parlaklığı. Yüksek yansıma ve ışıltı için optimize edildi.';
      case 2:
        return 'Dramatik kontrast. Daha belirgin gölge ile derinlik ve doku vurgulandı. Formları ortaya çıkaran güçlü ışık.';
      case 3:
        return 'Taş parlaklığı optimizasyonu. Elmasların ve taşların ışıltısı, rengi ve berraklığı maksimize edildi.';
      default:
        return 'Rötuşlanmış ürün fotoğrafı.';
    }
  };

  const handleSamplePromptClick = (samplePrompt: string) => {
    setPrompt(samplePrompt);
  };

  const handleSelectResult = (index: number) => {
    setSelectedResultIndex(index);
  };

  // Edit prompt işlemleri
  const handleEditPromptOpen = (index: number, description: string) => {
    setEditPromptIndex(index);
    setEditPromptText(description);
    setShowEditPromptModal(true);
  };

  const handleEditPromptApply = (newDescription: string) => {
    if (resultImages && resultImages[editPromptIndex]) {
      const updatedResults = [...resultImages];
      updatedResults[editPromptIndex] = {
        ...updatedResults[editPromptIndex],
        description: newDescription,
      };
      setResultImages(updatedResults);
    }
  };

  // CropModal'ı açma fonksiyonu (yeni)
  const openCropModal = () => {
    // Önce modali kapat (yeniden başlatma etkisi yaratır)
    setShowCropModal(false);

    // Kısa bir gecikme ile yeniden aç
    setTimeout(() => {
      setShowCropModal(true);
    }, 10);
  };

  // Arkaplanı kaldırma işlemini başlatan fonksiyon
  const handleRemoveBg = async (index: number, imageUrl: string) => {
    if (!imageUrl || !resultImages) return;

    try {
      console.log('Arkaplan kaldırma işlemi başlatılıyor...', {
        index,
        imageUrl,
      });
      setRemovingBgIndex(index);

      // API çağrısı yap
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/remove-bg`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        },
      );

      if (!response.ok) {
        throw new Error(`API yanıtı başarısız: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.transparentImageUrl) {
        throw new Error('API yanıtı beklenen veriyi içermiyor.');
      }

      // Resmi güncelle
      setResultImages((prevResults) => {
        if (!prevResults) return null;

        return prevResults.map((image, idx) => {
          if (idx !== index) return image;

          return {
            ...image,
            transparentBgUrl: result.transparentImageUrl,
          };
        });
      });

      console.log('Arkaplan kaldırma işlemi başarıyla tamamlandı:', result);
    } catch (error) {
      console.error('Arkaplan kaldırma işlemi sırasında hata:', error);
      alert(
        'Arkaplan kaldırma işlemi başarısız oldu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    } finally {
      setRemovingBgIndex(null);
    }
  };

  return (
    <>
      <Header
        icon={
          <Avatar.Root size='48' color='purple'>
            <Avatar.Image src='/images/avatar/illustration/arthur.png' alt='' />
          </Avatar.Root>
        }
        title='Ürün Rötuşlama'
        description='Ürün fotoğraflarınızı profesyonel görünüme kavuşturun'
      >
        <MoveMoneyButton className='hidden lg:flex' />
      </Header>

      <div className='flex flex-col gap-6 overflow-hidden px-4 pb-6 lg:px-8 lg:pt-1'>
        <div className='mx-auto grid w-full max-w-md grid-cols-1 items-start gap-6 lg:max-w-7xl lg:grid-cols-2 lg:justify-center'>
          <WidgetSourceAndPrompt
            onImageUpload={setUploadedImage}
            previewUrl={previewUrl}
            handleFileChange={handleFileChange}
            prompt={prompt}
            handlePromptChange={handlePromptChange}
            isGenerating={isGenerating}
            isDisabled={isGenerating || !uploadedImage}
            handleGenerate={handleGenerate}
            handleSamplePromptClick={handleSamplePromptClick}
            openCropModal={openCropModal}
            resetUpload={resetUpload}
            error={error}
            className='h-full'
          />

          <div className='flex flex-col gap-6'>
            <WidgetResults
              resultImages={resultImages}
              onSelectResult={handleSelectResult}
              selectedIndex={selectedResultIndex}
              openCropModal={openCropModal}
              onEditPrompt={handleEditPromptOpen}
              upscalingIndex={upscalingIndex}
              clarityProcessHistory={clarityProcessHistory}
              onClarityStart={handleClarityStart}
              onRemoveBg={handleRemoveBg}
              removingBgIndex={removingBgIndex}
              className='h-full'
            />

            {/* Netleştirilen Görüntüler Kartı */}
            {clarityProcessingImages.length > 0 && (
              <WidgetBox.Root>
                <WidgetBox.Header>
                  <WidgetBox.HeaderIcon as={RiMagicLine} color='purple' />
                  <span>Netleştirilen Görüntüler</span>
                  <span className='ml-auto text-paragraph-xs text-text-soft-400'>
                    {clarityProcessingImages.length} işlem sürüyor
                  </span>
                </WidgetBox.Header>
                <div className='grid grid-cols-2 gap-4 p-4'>
                  {clarityProcessingImages.map(
                    ({ index, originalImageUrl, startTime }) => (
                      <div
                        key={`clarity-processing-${index}`}
                        className='border border-stroke-soft-200 rounded-lg overflow-hidden'
                      >
                        <div className='aspect-square bg-bg-weak-50 relative'>
                          <img
                            src={originalImageUrl}
                            alt={`İşlenen görüntü ${index + 1}`}
                            className='w-full h-full object-contain opacity-50'
                          />
                          <div className='absolute inset-0 flex flex-col items-center justify-center'>
                            <div className='w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin'></div>
                            <span className='mt-4 text-xs text-text-soft-600 bg-white/80 px-2 py-1 rounded backdrop-blur-sm'>
                              {clarityTimers[index] !== undefined
                                ? `${formatTime(clarityTimers[index])} süredir işleniyor`
                                : 'İşleniyor...'}
                            </span>
                          </div>
                        </div>
                        <div className='p-2 bg-bg-weak-50 text-xs border-t border-stroke-soft-200'>
                          <div className='font-medium text-text-sub-600'>
                            Stil {index + 1} Netleştiriliyor
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </WidgetBox.Root>
            )}
          </div>
        </div>
      </div>

      {/* Modal bileşenleri */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageUrl={previewUrl}
        onCropComplete={handleCropComplete}
      />

      <EditPromptModal
        isOpen={showEditPromptModal}
        onClose={() => setShowEditPromptModal(false)}
        onApply={handleEditPromptApply}
        initialPrompt={editPromptText}
      />

      <FullscreenImageModal
        isOpen={!!fullscreenPreview}
        onClose={() => setFullscreenPreview(null)}
        imageUrl={fullscreenPreview}
      />
    </>
  );
}
