import {useMemo} from 'react'
import AssetImage from '../../components/ui/AssetImage'
// Metadata is enough to render a reserved slot. Signing and decoding happen in
// AssetImage only within its 400px observer margin, never for the whole library.
export default function AdminPreviewImage({image,repo,...props}){
 const path=image.storage_path,preview=useMemo(()=>repo.previewImage({storage_path:path}),[repo,path])
 return <AssetImage {...props} src={preview.url} delivery={preview.delivery} widths="320,640" loading="lazy" decoding="async"/>
}
