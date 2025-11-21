import SVG from "react-inlinesvg";
import { useDispatch } from "react-redux";
import { setSelectedGroup } from "../../../store/appSlice";
import { ReactNode, useEffect, useState } from "react";
import { renderToString } from "react-dom/server";

interface ThumbnailPaintingProps {
  elementID: string;
  svgFile: string;
}

export function ThumbnailPainting(props: ThumbnailPaintingProps) {
  const { elementID, svgFile } = props;
  const dispatch = useDispatch();

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(svgFile)
      .then((res) => res.text())
      .then(function (svgtext) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgtext, "image/svg+xml");
        const originalSvg = doc.querySelector("svg");

        const group = originalSvg?.querySelector(`#${elementID}`) ?? null;

        if (group != null) {
          const image = (group as SVGElement).querySelector("image");
          if (image != null) {
            setImage(image.getAttribute("xlink:href"));
          }
        }
      });
  }, [svgFile, elementID]);

  return (
    <div
      className={`size-12 rounded-full overflow-hidden bg-slate-50 relative cursor-pointer shadow-md items-center`}
      key={`timeline-sub-entry-${elementID}`}
      onClick={(e) => {
        dispatch(setSelectedGroup(elementID));
      }}
    >
      {image && (
        <div className="size-full flex items-center justify-center">
          <img className="" src={image} />
        </div>
      )}
    </div>
  );
}
