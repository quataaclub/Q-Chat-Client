'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import type {
  TargetAndTransition,
  Transition,
  Variant,
  Variants,
} from 'motion/react';
import React from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';

export type PerType = 'word' | 'char' | 'line';

export type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  containerTransition?: Transition;
  segmentTransition?: Transition;
  style?: React.CSSProperties;
  markdown?: boolean;
};

const defaultStaggerTimes: Record<PerType, number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: { opacity: 0 },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(12px)' },
    },
  },
  'fade-in-blur': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20, filter: 'blur(12px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, y: 20, filter: 'blur(12px)' },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
};

const AnimationComponent: React.FC<{
  segment: string;
  variants: Variants;
  per: 'line' | 'word' | 'char';
  segmentWrapperClassName?: string;
}> = React.memo(({ segment, variants, per, segmentWrapperClassName }) => {
  const content =
    per === 'line' ? (
      <motion.span variants={variants} className="block">
        {segment}
      </motion.span>
    ) : per === 'word' ? (
      <motion.span
        aria-hidden="true"
        variants={variants}
        className="inline-block whitespace-pre"
      >
        {segment}
      </motion.span>
    ) : (
      <motion.span className="inline-block whitespace-pre">
        {segment.split('').map((char, charIndex) => (
          <motion.span
            key={`char-${charIndex}`}
            aria-hidden="true"
            variants={variants}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );

  if (!segmentWrapperClassName) {
    return content;
  }

  const defaultWrapperClassName = per === 'line' ? 'block' : 'inline-block';

  return (
    <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
      {content}
    </span>
  );
});

AnimationComponent.displayName = 'AnimationComponent';

const splitText = (text: string, per: PerType) => {
  if (per === 'line') return text.split('\n');
  return text.split(/(\s)/);
};

const hasTransition = (
  variant?: Variant,
): variant is TargetAndTransition & { transition?: Transition } => {
  if (!variant) return false;
  return typeof variant === 'object' && 'transition' in variant;
};

const createVariantsWithTransition = (
  baseVariants: Variants,
  transition?: Transition & { exit?: Transition },
): Variants => {
  if (!transition) return baseVariants;

  const { ...mainTransition } = transition;

  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(hasTransition(baseVariants.visible)
          ? baseVariants.visible.transition
          : {}),
        ...mainTransition,
      },
    },
    exit: {
      ...baseVariants.exit,
      transition: {
        ...(hasTransition(baseVariants.exit)
          ? baseVariants.exit.transition
          : {}),
        ...mainTransition,
        staggerDirection: -1,
      },
    },
  };
};

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset = 'fade',
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  style,
  markdown = false,
}: TextEffectProps) {
  const segments = splitText(children, per);
  const tagName = markdown ? 'div' : as;
  const MotionTag = motion[tagName as keyof typeof motion] as typeof motion.div;

  const baseVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };

  const stagger = defaultStaggerTimes[per] / speedReveal;

  const baseDuration = 0.3 / speedSegment;

  const customStagger = hasTransition(variants?.container?.visible ?? {})
    ? (variants?.container?.visible as TargetAndTransition).transition
        ?.staggerChildren
    : undefined;

  const customDelay = hasTransition(variants?.container?.visible ?? {})
    ? (variants?.container?.visible as TargetAndTransition).transition
        ?.delayChildren
    : undefined;

  const computedVariants = {
    container: createVariantsWithTransition(
      variants?.container || baseVariants.container,
      {
        staggerChildren: customStagger ?? stagger,
        delayChildren: customDelay ?? delay,
        ...containerTransition,
        exit: {
          staggerChildren: customStagger ?? stagger,
          staggerDirection: -1,
        },
      },
    ),
    item: createVariantsWithTransition(variants?.item || baseVariants.item, {
      duration: baseDuration,
      ...segmentTransition,
    }),
  };

  const markdownRenderer: Components = {
    h1: h1 => <h1 className="text-xl font-bold lg:text-2xl" {...h1} />,
    h2: h2 => <h2 className="text-lg font-semibold lg:text-xl" {...h2} />,
    p: p => <p className="text-base lg:text-lg" {...p} />,
    code: code => (
      <code className="rounded bg-gray-200 p-1 dark:bg-gray-800" {...code} />
    ),
    li: li => <li className="text-base lg:text-lg" {...li} />,
    pre: pre => (
      <pre
        className="my-2 overflow-x-auto rounded bg-gray-100 p-3 dark:bg-gray-900"
        {...pre}
      />
    ),
    a: ({ href, children, ...rest }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline dark:text-blue-400"
        {...rest}
      >
        {children}
      </a>
    ),
    strong: ({ ...props }) => <strong className="font-bold" {...props} />,
    em(props) {
      const { ...rest } = props;
      return (
        <i
          className="text-blue-600 hover:underline dark:text-blue-400"
          {...rest}
        />
      );
    },
  };

  if (markdown) {
    return (
      <AnimatePresence mode="popLayout">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={computedVariants.container}
          className={className}
          style={style}
        >
          <Markdown
            components={markdownRenderer}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {children}
          </Markdown>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={computedVariants.container}
          className={className}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={style}
        >
          <>
            {per !== 'line' && <span className="sr-only">{children}</span>}
            {segments.map((segment, index) => (
              <AnimationComponent
                key={`${per}-${index}-${segment}`}
                segment={segment}
                variants={computedVariants.item}
                per={per}
                segmentWrapperClassName={segmentWrapperClassName}
              />
            ))}
          </>
        </MotionTag>
      )}
    </AnimatePresence>
  );
}
