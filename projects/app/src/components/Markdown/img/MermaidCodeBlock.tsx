import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import mermaid from 'mermaid';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useCopyData } from '@fastgpt/web/hooks/useCopyData';
import { useTranslation } from 'next-i18next';

const mermaidAPI = mermaid.mermaidAPI;
mermaidAPI.initialize({
  startOnLoad: true,
  theme: 'base',
  flowchart: {
    useMaxWidth: false
  },
  themeVariables: {
    fontSize: '14px',
    primaryColor: '#d6e8ff',
    primaryTextColor: '#485058',
    primaryBorderColor: '#fff',
    lineColor: '#5A646E',
    secondaryColor: '#B5E9E5',
    tertiaryColor: '#485058'
  }
});

const punctuationMap: Record<string, string> = {
  '，': ',',
  '；': ';',
  '。': '.',
  '：': ':',
  '！': '!',
  '？': '?',
  '\u201C': '"',
  '\u201D': '"',
  '\u2018': "'",
  '\u2019': "'",
  '【': '[',
  '】': ']',
  '（': '(',
  '）': ')',
  '《': '<',
  '》': '>',
  '、': ','
};

const MermaidBlock = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const { t } = useTranslation();
  const { copyData } = useCopyData();

  useEffect(() => {
    (async () => {
      if (!code) return;
      try {
        const formatCode = code.replace(
          new RegExp(`[${Object.keys(punctuationMap).join('')}]`, 'g'),
          (match) => punctuationMap[match]
        );
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, formatCode);
        setSvg(svg);
      } catch (e: any) {
        // console.log('[Mermaid] ', e?.message);
      }
    })();
  }, [code]);

  const onclickExport = useCallback(() => {
    if (!ref.current) return;
    const svgEl = ref.current.querySelector('svg') as SVGSVGElement | null;
    if (!svgEl) return;

    // Use viewBox for reliable intrinsic dimensions — clientHeight can be 0
    // when the SVG has height="100%" and its parent has no explicit height.
    const vb = svgEl.viewBox?.baseVal;
    const svgW = vb?.width && vb.width > 0 ? vb.width : svgEl.clientWidth;
    const svgH = vb?.height && vb.height > 0 ? vb.height : svgEl.clientHeight;
    if (!svgW || !svgH) return;

    const w = 3000;
    const h = Math.round((svgH / svgW) * w);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ref.current?.innerHTML ?? '')}`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);

      const jpgDataUrl = canvas.toDataURL('image/jpeg', 1);
      const a = document.createElement('a');
      a.href = jpgDataUrl;
      a.download = 'mermaid.jpg';
      document.body.appendChild(a);
      a.click();
      document.body?.removeChild(a);
    };
    img.onerror = (e) => {
      console.log(e);
    };
  }, []);

  return (
    <Box my={3} borderRadius={'md'} overflow={'hidden'} boxShadow={'0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)'}>
      <Flex
        py={2}
        px={5}
        bg={'myGray.600'}
        color={'white'}
        fontSize={'sm'}
        userSelect={'none'}
        alignItems={'center'}
      >
        <Box flex={1}>mermaid</Box>
        <Flex gap={4}>
          <Flex cursor={'pointer'} onClick={() => copyData(code)} alignItems={'center'}>
            <MyIcon name={'copy'} w={'15px'} h={'15px'} />
            <Box ml={1}>{t('common:Copy')}</Box>
          </Flex>
          {svg && (
            <Flex cursor={'pointer'} onClick={onclickExport} alignItems={'center'}>
              <MyIcon name={'export'} w={'15px'} h={'15px'} />
              <Box ml={1}>{t('common:Download')}</Box>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Box
        overflowX={'auto'}
        ref={ref}
        minW={'100px'}
        minH={'50px'}
        py={4}
        bg={'white'}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </Box>
  );
};

export default MermaidBlock;
