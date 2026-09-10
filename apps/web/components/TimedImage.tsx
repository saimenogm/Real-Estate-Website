'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaSetDto } from '../lib/api';
import { mediaSrc, resolveAsset } from '../lib/media';
import { useTimeState } from '../lib/time-state/TimeStateProvider';

/** §2.3 — images crossfade over 1200ms. */
const CROSSFADE_MS = 1200;

/**
 * §6.2 — two stacked layers: the outgoing image sits underneath at full
 * opacity while the incoming one fades in over it, then the outgoing layer is
 * dropped.
 *
 * The fade is a CSS animation on the incoming image rather than a JS-driven
 * opacity toggle. A toggle needs a paint between "mounted opaque" and "animate
 * to zero", which means requestAnimationFrame — and rAF does not run in a
 * background tab, so the outgoing layer would sit opaque over the new image
 * until its timer fired. With the animation on the incoming layer, the steady
 * state is already correct: if the animation is throttled or unsupported the
 * change is simply instant, which is also what reduced motion asks for.
 *
 * Phase 2 replaces the <img> with the AVIF/WebP `<picture>` ladder and the
 * thumbhash placeholder.
 */
export function TimedImage({
  set,
  priority = false,
  className,
}: {
  set: MediaSetDto;
  priority?: boolean;
  className?: string;
}) {
  const { state, reducedMotion } = useTimeState();
  const asset = resolveAsset(set, state);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const previous = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const src = asset ? mediaSrc(asset.originalKey) : null;

  useEffect(() => {
    if (!src) return;
    if (previous.current && previous.current !== src && !reducedMotion) {
      setOutgoing(previous.current);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOutgoing(null), CROSSFADE_MS);
    }
    previous.current = src;
  }, [src, reducedMotion]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!asset || !src) {
    // §6.7 — never a broken image. An empty, correctly-sized box is better.
    return <div className={className} data-media-missing={set.key} aria-hidden="true" />;
  }

  return (
    <div className={className} data-media-set={set.key}>
      {outgoing && (
        <img src={outgoing} alt="" aria-hidden="true" className="timed-image timed-image-under" />
      )}
      <img
        key={src}
        src={src}
        alt={asset.altText ?? set.label}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="timed-image timed-image-over"
        data-crossfade={outgoing ? 'in' : undefined}
      />
    </div>
  );
}
