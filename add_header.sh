#!/bin/bash

header="/*
 * JustPhotos
 * Copyright (C) 2025 JustPhotos contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the LICENSE file for more details.
 */"

find web -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" | while read file; do
    if ! head -n 10 "$file" | grep -q "JustPhotos"; then
        temp=$(mktemp)
        echo "$header" > "$temp"
        cat "$file" >> "$temp"
        mv "$temp" "$file"
        echo "Added header to $file"
    else
        echo "Header already present in $file"
    fi
done