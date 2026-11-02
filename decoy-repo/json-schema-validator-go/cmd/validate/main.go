package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/santhosh-tekuri/jsonschema/v6"
)

func main() {
	schemaPath := flag.String("schema", "", "path to JSON Schema file")
	documentPath := flag.String("document", "", "path to JSON document")
	flag.Parse()

	if *schemaPath == "" || *documentPath == "" {
		fmt.Fprintln(os.Stderr, "usage: validate -schema schema.json -document data.json")
		os.Exit(2)
	}

	schemaBytes, err := os.ReadFile(*schemaPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read schema: %v\n", err)
		os.Exit(1)
	}

	docBytes, err := os.ReadFile(*documentPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read document: %v\n", err)
		os.Exit(1)
	}

	compiler := jsonschema.NewCompiler()
	if err := compiler.AddResource("schema.json", schemaBytes); err != nil {
		fmt.Fprintf(os.Stderr, "compile schema: %v\n", err)
		os.Exit(1)
	}

	schema, err := compiler.Compile("schema.json")
	if err != nil {
		fmt.Fprintf(os.Stderr, "compile schema: %v\n", err)
		os.Exit(1)
	}

	var doc any
	if err := json.Unmarshal(docBytes, &doc); err != nil {
		fmt.Fprintf(os.Stderr, "parse document: %v\n", err)
		os.Exit(1)
	}

	if err := schema.Validate(doc); err != nil {
		fmt.Fprintf(os.Stderr, "invalid: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("ok")
}
