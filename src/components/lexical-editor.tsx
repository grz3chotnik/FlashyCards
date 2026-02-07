"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import type { EditorState, LexicalEditor as LexicalEditorType } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { CodeNode, $createCodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $setBlocksType } from "@lexical/selection";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Quote,
  CodeXml,
  List,
  ListOrdered,
  Image,
  Pilcrow,
  Loader2,
} from "lucide-react";
import { ImageNode, $createImageNode } from "./image-node";
import { useUploadThing } from "@/lib/uploadthing";

const theme = {
  paragraph: "mb-1",
  heading: {
    h1: "text-2xl font-bold mb-2",
    h2: "text-xl font-bold mb-1",
    h3: "text-lg font-bold mb-1",
  },
  list: {
    ul: "list-disc ml-4 mb-1",
    ol: "list-decimal ml-4 mb-1",
    listitem: "mb-0.5",
  },
  quote: "border-l-2 border-foreground/30 pl-3 italic text-foreground/70 mb-1",
  code: "bg-foreground/10 rounded px-1 py-0.5 font-mono text-sm",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-foreground/10 rounded px-1 py-0.5 font-mono text-sm",
  },
  image: "my-2 max-w-full rounded",
};

function ToolbarButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<Toolbar.Button onClick={onClick} className={className} />}
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6}>
          <Tooltip.Popup className="rounded bg-foreground px-2 py-1 text-xs text-background shadow-lg">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

const ICON_SIZE = 20;

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("cardImage");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  async function uploadAndInsertImage(file: File) {
    setIsUploading(true);
    try {
      const res = await startUpload([file]);
      if (!res?.[0]) return;
      const url = res[0].ufsUrl;
      editor.update(() => {
        const imageNode = $createImageNode({ src: url, altText: file.name });
        $insertNodes([imageNode]);
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await uploadAndInsertImage(file);
  }

  const btnClass = (active: boolean) =>
    `rounded px-1.5 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-foreground/20 text-foreground"
        : "text-foreground hover:bg-foreground/10 hover:text-foreground"
    }`;

  return (
    <Tooltip.Provider delay={400}>
      <Toolbar.Root className="flex flex-wrap items-center gap-0.5 border-b border-foreground/20 px-2 py-1">
        <Toolbar.Group className="flex gap-0.5">
          <ToolbarButton
            label="Bold"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
            }
            className={btnClass(isBold)}
          >
            <Bold size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
            }
            className={btnClass(isItalic)}
          >
            <Italic size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
            }
            className={btnClass(isUnderline)}
          >
            <Underline size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
            }
            className={btnClass(isStrikethrough)}
          >
            <Strikethrough size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Inline Code"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
            }
            className={btnClass(isCode)}
          >
            <Code size={ICON_SIZE} />
          </ToolbarButton>
        </Toolbar.Group>

        <Toolbar.Separator className="mx-1 h-4 w-px bg-foreground/20" />

        <Toolbar.Group className="flex gap-0.5">
          <ToolbarButton
            label="Heading"
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode("h2"));
                }
              });
            }}
            className={btnClass(false)}
          >
            <Heading2 size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createQuoteNode());
                }
              });
            }}
            className={btnClass(false)}
          >
            <Quote size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Code Block"
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createCodeNode());
                }
              });
            }}
            className={btnClass(false)}
          >
            <CodeXml size={ICON_SIZE} />
          </ToolbarButton>
        </Toolbar.Group>

        <Toolbar.Separator className="mx-1 h-4 w-px bg-foreground/20" />

        <Toolbar.Group className="flex gap-0.5">
          <ToolbarButton
            label="Bullet List"
            onClick={() =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            }
            className={btnClass(false)}
          >
            <List size={ICON_SIZE} />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered List"
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
            className={btnClass(false)}
          >
            <ListOrdered size={ICON_SIZE} />
          </ToolbarButton>
        </Toolbar.Group>

        <Toolbar.Separator className="mx-1 h-4 w-px bg-foreground/20" />

        <Toolbar.Group className="flex gap-0.5">
          <ToolbarButton
            label={isUploading ? "Uploading..." : "Insert Image"}
            onClick={() => !isUploading && imageInputRef.current?.click()}
            className={btnClass(false)}
          >
            {isUploading ? (
              <Loader2 size={ICON_SIZE} className="animate-spin" />
            ) : (
              <Image size={ICON_SIZE} />
            )}
          </ToolbarButton>
          <ToolbarButton
            label="Normal Text"
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createParagraphNode());
                }
              });
            }}
            className={btnClass(false)}
          >
            <Pilcrow size={ICON_SIZE} />
          </ToolbarButton>
        </Toolbar.Group>
      </Toolbar.Root>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </Tooltip.Provider>
  );
}

function ImagePastePlugin() {
  const [editor] = useLexicalComposerContext();
  const { startUpload } = useUploadThing("cardImage");

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          startUpload([file]).then((res) => {
            if (!res?.[0]) return;
            const url = res[0].ufsUrl;
            editor.update(() => {
              const imageNode = $createImageNode({
                src: url,
                altText: "Pasted image",
              });
              $insertNodes([imageNode]);
            });
          });
          break;
        }
      }
    }

    root.addEventListener("paste", handlePaste);
    return () => root.removeEventListener("paste", handlePaste);
  }, [editor, startUpload]);

  return null;
}

function LoadInitialHTMLPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      nodes.forEach((node) => root.append(node));
    });
  }, [editor, html]);

  return null;
}

type LexicalEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function LexicalEditor({
  value,
  onChange,
  placeholder = "Type something...",
}: LexicalEditorProps) {
  const [key, setKey] = useState(0);

  // Remount the editor when value is set externally to empty (e.g. form reset)
  useEffect(() => {
    if (value === "") {
      setKey((k) => k + 1);
    }
  }, [value]);

  const initialConfig = useMemo(
    () => ({
      namespace: "FlashyCardsEditor",
      theme,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        LinkNode,
        AutoLinkNode,
        ImageNode,
      ],
      onError: (error: Error) => console.error(error),
    }),
    []
  );

  const handleChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditorType) => {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer key={key} initialConfig={initialConfig}>
      <div className="overflow-hidden rounded-md border border-foreground/20">
        <ToolbarPlugin />
        <div className="relative min-h-[120px] px-3 py-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[100px] text-sm text-foreground outline-none" />
            }
            placeholder={
              <div className="lexical-placeholder">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <ImagePastePlugin />
          <OnChangePlugin onChange={handleChange} />
          {value && key === 0 && <LoadInitialHTMLPlugin html={value} />}
        </div>
      </div>
    </LexicalComposer>
  );
}
