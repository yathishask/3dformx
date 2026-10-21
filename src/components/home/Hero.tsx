import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoveLeft, MoveRight } from 'lucide-react';
import { HeroSlide } from '../../data/heroSlides';
import { productService } from '../../services/productService';

const AUTO_SLIDE_INTERVAL = 4500; // 4.5 seconds per slide

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch dynamic hero slides strictly from Supabase hero_slides table
  useEffect(() => {
    let active = true;
    productService.getHeroSlides().then((data) => {
      if (active) {
        setSlides(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const totalSlides = slides.length;

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  // Touch & Mouse swipe state
  const dragStartX = useRef<number | null>(null);
  const dragEndX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const didSwipe = useRef<boolean>(false);

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Automatic slideshow timer
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, totalSlides]);

  // Handle swipe completion (both touch and mouse drag)
  const handleSwipeEnd = () => {
    if (dragStartX.current !== null && dragEndX.current !== null) {
      const diff = dragStartX.current - dragEndX.current;
      const minSwipeDistance = 50;

      if (diff > minSwipeDistance) {
        didSwipe.current = true;
        nextSlide();
      } else if (diff < -minSwipeDistance) {
        didSwipe.current = true;
        prevSlide();
      }
    }
    dragStartX.current = null;
    dragEndX.current = null;
    isDragging.current = false;
  };

  // Touch events for mobile/tablet swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    didSwipe.current = false;
    dragStartX.current = e.targetTouches[0].clientX;
    dragEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    dragEndX.current = currentX;
    if (dragStartX.current !== null && Math.abs(dragStartX.current - currentX) > 10) {
      didSwipe.current = true;
    }
  };

  const onTouchEnd = () => {
    handleSwipeEnd();
    setIsPaused(false);
  };

  // Mouse events for desktop drag-swipe
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    didSwipe.current = false;
    dragStartX.current = e.clientX;
    dragEndX.current = null;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    dragEndX.current = e.clientX;
    if (dragStartX.current !== null && Math.abs(dragStartX.current - e.clientX) > 10) {
      didSwipe.current = true;
    }
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    handleSwipeEnd();
  };

  const onMouseLeave = () => {
    if (isDragging.current) {
      handleSwipeEnd();
    }
    setIsPaused(false);
  };

  const handleSlideClick = (ctaLink: string) => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    const target = ctaLink?.trim() || '/shop';
    if (/^https?:\/\//i.test(target)) {
      window.location.href = target;
    } else {
      navigate(target);
    }
  };

  if (totalSlides === 0) {
    return (
      <section className="relative w-full h-[78vh] sm:h-[86vh] lg:h-[92vh] min-h-[540px] max-h-[960px] bg-dark-950" />
    );
  }

  return (
    <section
      className="relative w-full h-[78vh] sm:h-[86vh] lg:h-[92vh] min-h-[540px] max-h-[960px] overflow-hidden bg-dark-950 select-none cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      aria-label="Hero Banner Slideshow"
    >
      {/* Slides Track */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const hasTitle = Boolean(slide.title && slide.title.trim());
        const hasSubtitle = Boolean(slide.subtitle && slide.subtitle.trim());
        const hasPriceText = Boolean(slide.priceText && slide.priceText.trim());
        const hasBoxContent = hasTitle || hasSubtitle || hasPriceText;
        const hasTag = Boolean(slide.tag && slide.tag.trim());
        const hasCta = Boolean(slide.ctaText && slide.ctaText.trim());

        return (
          <div
            key={slide.id}
            onClick={() => handleSlideClick(slide.ctaLink)}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Full-bleed Background Image with subtle zoom animation when active */}
            <img
              src={slide.image}
              alt={slide.title || '3D FormX Banner'}
              draggable={false}
              className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {hasBoxContent ? (
              <>
                {/* Dark & Brand Vignette Overlays so transparent navbar & center text are crisp */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80" />
                <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70" />

                {/* Centerpiece Content Overlay (ReiseMoto Banner Style in 3D FormX Brand Colors) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center pt-14 sm:pt-16">
                  {/* Top Festival / Series Badge */}
                  {hasTag && (
                    <div className="mb-4 sm:mb-5 px-5 py-1.5 rounded-full bg-dark-950/80 border border-brand-orange/60 backdrop-blur-md shadow-xl">
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.22em] text-brand-orange font-mono">
                        {slide.tag}
                      </span>
                    </div>
                  )}

                  {/* Main Glass / Dark Frame Card */}
                  <div className="relative max-w-2xl w-full mx-auto px-6 py-7 sm:px-12 sm:py-10 rounded-2xl bg-dark-950/75 border-2 border-brand-orange/70 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.85)]">
                    {/* Corner Accent Lines */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />

                    {hasSubtitle && (
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-slate-300 mb-2">
                        {slide.subtitle}
                      </p>
                    )}

                    {hasTitle && (
                      <h1
                        className={`text-2xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-tight font-heading drop-shadow-md ${
                          hasPriceText ? 'mb-6' : ''
                        }`}
                      >
                        {slide.title}
                      </h1>
                    )}

                    {/* Brand Orange Price Pill */}
                    {hasPriceText && (
                      <div className="inline-block bg-brand-orange text-black font-extrabold text-sm sm:text-lg md:text-xl px-6 py-2 rounded-lg shadow-lg shadow-brand-orange/25 tracking-wide">
                        {slide.priceText}
                      </div>
                    )}
                  </div>

                  {/* Rounded Pill SHOP NOW CTA Button below frame */}
                  {hasCta && (
                    <div className="mt-6 sm:mt-7">
                      <Link
                        to={slide.ctaLink}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center px-9 py-3 rounded-full bg-dark-950/90 hover:bg-brand-orange text-white hover:text-black border-2 border-white/80 hover:border-brand-orange font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl hover:scale-105"
                      >
                        {slide.ctaText}
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Subtle top/bottom edge protection for navbar and slide controls without darkening the banner image */
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />
            )}
          </div>
        );
      })}

      {/* Bottom Controls Bar: Left Arrow (←), Center Pagination Dots (• ○ •), Right Arrow (→) */}
      {totalSlides > 1 && (
        <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-20 px-6 sm:px-12 lg:px-16">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            {/* Bottom-Left Prev Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous slide"
              className="group p-2 text-white/85 hover:text-brand-orange transition-colors focus:outline-none"
            >
              <MoveLeft
                size={28}
                strokeWidth={1.75}
                className="transition-transform duration-300 group-hover:-translate-x-1.5 drop-shadow-md"
              />
            </button>

            {/* Bottom-Center Pagination Dots (ReiseMoto Ring + Dot Style) */}
            <div className="flex items-center gap-3">
              {slides.map((slide, idx) => {
                const active = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`relative flex items-center justify-center transition-all duration-300 focus:outline-none ${
                      active ? 'w-5 h-5' : 'w-3 h-3'
                    }`}
                  >
                    {active ? (
                      <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 hover:bg-white transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom-Right Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next slide"
              className="group p-2 text-white/85 hover:text-brand-orange transition-colors focus:outline-none"
            >
              <MoveRight
                size={28}
                strokeWidth={1.75}
                className="transition-transform duration-300 group-hover:translate-x-1.5 drop-shadow-md"
              />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
